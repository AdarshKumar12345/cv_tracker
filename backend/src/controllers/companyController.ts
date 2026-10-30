import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Company } from '../models/Company';
import { Application } from '../models/Application';
import { getParamId } from '../utils/params';
import mongoose from 'mongoose';

export const getCompanies = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { search } = req.query;

    const query: any = { userId };
    if (search) {
      query.name = { $regex: new RegExp(String(search), 'i') };
    }

    const companies = await Company.find(query).sort({ name: 1 });

    // Aggregate applications count per company
    const counts = await Application.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), companyId: { $exists: true, $ne: null } } },
      { $group: { _id: '$companyId', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const companiesWithCount = companies.map((comp) => ({
      ...comp.toObject(),
      applicationCount: countMap[comp._id.toString()] || 0,
    }));

    res.json({
      success: true,
      data: companiesWithCount,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCompany = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const company = await Company.create({
      ...req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: company,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCompanyById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid company ID' });
      return;
    }

    const company = await Company.findOne({ _id: id, userId });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    const applications = await Application.find({ userId, companyId: id }).sort({
      applicationDate: -1,
    });

    res.json({
      success: true,
      data: {
        ...company.toObject(),
        applications,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCompany = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid company ID' });
      return;
    }

    const company = await Company.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    // Sync companyName across applications if company name changed
    if (req.body.name) {
      await Application.updateMany(
        { userId, companyId: id },
        { $set: { companyName: req.body.name } }
      );
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCompany = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid company ID' });
      return;
    }

    const company = await Company.findOneAndDelete({ _id: id, userId });
    if (!company) {
      res.status(404).json({ success: false, message: 'Company not found' });
      return;
    }

    // Unlink company from applications without deleting applications
    await Application.updateMany({ userId, companyId: id }, { $unset: { companyId: '' } });

    res.json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
