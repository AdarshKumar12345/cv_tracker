import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Resume } from '../models/Resume';
import { Application } from '../models/Application';
import path from 'path';
import fs from 'fs';
import { getParamId } from '../utils/params';
import mongoose from 'mongoose';

export const getResumes = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const resumes = await Resume.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    // Aggregate application counts for each resume
    const counts = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), resumeId: { $exists: true, $ne: null } } },
      { $group: { _id: '$resumeId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    const resumesWithCount = resumes.map((resume) => {
      const obj = resume.toObject();
      return {
        ...obj,
        applicationCount: countMap[resume._id.toString()] || 0,
      };
    });

    res.json({
      success: true,
      data: resumesWithCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadResumeFile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'Please select a file to upload.' });
      return;
    }

    const { title, isDefault = false } = req.body;
    const resumeTitle = title?.trim() || file.originalname.replace(/\.[^/.]+$/, '');

    // Check version for resumes with similar title
    const existingCount = await Resume.countDocuments({
      userId,
      title: new RegExp(`^${resumeTitle}$`, 'i'),
    });

    const version = existingCount + 1;

    // Check if this is the first resume
    const totalUserResumes = await Resume.countDocuments({ userId });
    const makeDefault = totalUserResumes === 0 || isDefault === 'true' || isDefault === true;

    if (makeDefault) {
      await Resume.updateMany({ userId }, { $set: { isDefault: false } });
    }

    const relativeUrl = `/uploads/${file.filename}`;

    const resume = await Resume.create({
      userId,
      title: resumeTitle,
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: relativeUrl,
      fileType: file.mimetype,
      fileSize: file.size,
      version,
      isDefault: makeDefault,
      skills: [],
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getResumeById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resume ID' });
      return;
    }

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const linkedApplications = await Application.find(
      { userId, resumeId: id },
      'companyName jobTitle status applicationDate'
    );

    res.json({
      success: true,
      data: {
        ...resume.toObject(),
        linkedApplications,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadResume = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resume ID' });
      return;
    }

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    const filePath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', resume.fileName);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, message: 'Resume file not found on disk' });
      return;
    }

    res.download(filePath, resume.originalName);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const setDefaultResume = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resume ID' });
      return;
    }

    await Resume.updateMany({ userId }, { $set: { isDefault: false } });

    const resume = await Resume.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isDefault: true } },
      { new: true }
    );

    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    res.json({
      success: true,
      message: `"${resume.title}" marked as default resume`,
      data: resume,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteResume = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid resume ID' });
      return;
    }

    const resume = await Resume.findOneAndDelete({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ success: false, message: 'Resume not found' });
      return;
    }

    // Attempt to remove physical file
    const filePath = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads', resume.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete resume file from disk:', e);
      }
    }

    // Unlink from applications
    await Application.updateMany({ userId, resumeId: id }, { $unset: { resumeId: '' } });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
