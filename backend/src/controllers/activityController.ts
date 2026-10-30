import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Activity } from '../models/Activity';
import mongoose from 'mongoose';

export const getActivities = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { applicationId, limit = '20', page = '1' } = req.query;

    const query: any = { userId };
    if (applicationId && mongoose.Types.ObjectId.isValid(String(applicationId))) {
      query.applicationId = applicationId;
    }

    const limitNum = parseInt(limit as string, 10) || 20;
    const pageNum = parseInt(page as string, 10) || 1;
    const skip = (pageNum - 1) * limitNum;

    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('applicationId', 'companyName jobTitle status'),
      Activity.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: activities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createActivity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { applicationId, type = 'NOTE_ADDED', description, metadata } = req.body;

    if (!description) {
      res.status(400).json({ success: false, message: 'Description is required' });
      return;
    }

    const activity = await Activity.create({
      userId,
      applicationId: applicationId || undefined,
      type,
      description,
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
      data: activity,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
