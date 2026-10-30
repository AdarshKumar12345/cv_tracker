import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Application } from '../models/Application';
import { Activity } from '../models/Activity';
import { Company } from '../models/Company';
import { Interview } from '../models/Interview';
import { getParamId } from '../utils/params';
import mongoose from 'mongoose';

export const getApplications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      status,
      jobType,
      priority,
      search,
      sortBy = 'applicationDate',
      sortOrder = 'desc',
      page = '1',
      limit = '50',
    } = req.query;

    const query: any = { userId, isArchived: false };

    if (status && status !== 'All') {
      query.status = status;
    }
    if (jobType && jobType !== 'All') {
      query.jobType = jobType;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [
        { companyName: searchRegex },
        { jobTitle: searchRegex },
        { jobLocation: searchRegex },
        { notes: searchRegex },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const sortOption: any = {};
    sortOption[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('companyId', 'name website logoUrl location')
        .populate('resumeId', 'title fileName originalName version')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApplicationById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const application = await Application.findOne({ _id: id, userId })
      .populate('companyId')
      .populate('resumeId');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const [interviews, activities] = await Promise.all([
      Interview.find({ applicationId: id, userId }).sort({ scheduledAt: -1 }),
      Activity.find({ applicationId: id, userId }).sort({ createdAt: -1 }),
    ]);

    res.json({
      success: true,
      data: {
        ...application.toObject(),
        interviews,
        activities,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const body = req.body;

    let companyId = body.companyId;

    // If companyId is not provided, check if company with same name exists, or create one automatically
    if (!companyId && body.companyName) {
      let company = await Company.findOne({
        userId,
        name: { $regex: new RegExp(`^${body.companyName.trim()}$`, 'i') },
      });

      if (!company) {
        company = await Company.create({
          userId,
          name: body.companyName.trim(),
          location: body.jobLocation || '',
          recruiterContacts: body.recruiterContact?.name
            ? [body.recruiterContact]
            : [],
        });
      }
      companyId = company._id;
    }

    const application = await Application.create({
      ...body,
      userId,
      companyId,
    });

    // Create activity record
    await Activity.create({
      userId,
      applicationId: application._id,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      type: 'APPLICATION_CREATED',
      description: `Added application for ${application.jobTitle} at ${application.companyName}`,
      metadata: { status: application.status },
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const oldApp = await Application.findOne({ _id: id, userId });
    if (!oldApp) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const updatedApp = await Application.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('companyId')
      .populate('resumeId');

    // If status changed in normal edit
    if (req.body.status && req.body.status !== oldApp.status) {
      await Activity.create({
        userId,
        applicationId: id,
        companyName: updatedApp?.companyName,
        jobTitle: updatedApp?.jobTitle,
        type: 'STATUS_CHANGED',
        description: `Status changed from "${oldApp.status}" to "${req.body.status}"`,
        metadata: { oldStatus: oldApp.status, newStatus: req.body.status },
      });
    }

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApp,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;
    const { status, statusOrder = 0 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const app = await Application.findOne({ _id: id, userId });
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const oldStatus = app.status;
    app.status = status;
    app.statusOrder = statusOrder;
    await app.save();

    if (oldStatus !== status) {
      await Activity.create({
        userId,
        applicationId: id,
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        type: status === 'Offer Received' ? 'OFFER_RECEIVED' : 'STATUS_CHANGED',
        description: `Status changed from "${oldStatus}" to "${status}"`,
        metadata: { oldStatus, newStatus: status },
      });
    }

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: app,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const app = await Application.findOneAndDelete({ _id: id, userId });
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Clean up related interviews and log activity
    await Interview.deleteMany({ applicationId: id, userId });
    await Activity.create({
      userId,
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      type: 'APPLICATION_DELETED',
      description: `Deleted application for ${app.jobTitle} at ${app.companyName}`,
    });

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
