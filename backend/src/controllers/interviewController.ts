import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Interview } from '../models/Interview';
import { Application } from '../models/Application';
import { Activity } from '../models/Activity';
import { getParamId } from '../utils/params';
import mongoose from 'mongoose';

export const getInterviews = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { timeframe = 'all', applicationId } = req.query;

    const query: any = { userId };

    if (applicationId && mongoose.Types.ObjectId.isValid(String(applicationId))) {
      query.applicationId = applicationId;
    }

    const now = new Date();
    if (timeframe === 'upcoming') {
      query.scheduledAt = { $gte: now };
    } else if (timeframe === 'past') {
      query.scheduledAt = { $lt: now };
    }

    const interviews = await Interview.find(query)
      .populate('applicationId', 'companyName jobTitle status jobLocation salaryRange')
      .sort({ scheduledAt: timeframe === 'past' ? -1 : 1 });

    res.json({
      success: true,
      data: interviews,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createInterview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { applicationId, scheduledAt, round, ...rest } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      res.status(400).json({ success: false, message: 'Invalid application ID' });
      return;
    }

    const application = await Application.findOne({ _id: applicationId, userId });
    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const interview = await Interview.create({
      ...rest,
      round,
      scheduledAt: new Date(scheduledAt),
      applicationId,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      userId,
    });

    // Optionally bump application status to "Interview Scheduled" if it was in Wishlist/Applied/Under Review
    if (['Wishlist', 'Applied', 'Under Review'].includes(application.status)) {
      application.status = 'Interview Scheduled';
      await application.save();
    }

    // Log Activity
    await Activity.create({
      userId,
      applicationId: application._id,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      type: 'INTERVIEW_SCHEDULED',
      description: `${round} interview scheduled with ${application.companyName} on ${new Date(scheduledAt).toLocaleDateString()}`,
      metadata: {
        round,
        scheduledAt,
        interviewType: interview.interviewType,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateInterview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid interview ID' });
      return;
    }

    const oldInterview = await Interview.findOne({ _id: id, userId });
    if (!oldInterview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    const updated = await Interview.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (req.body.outcome && req.body.outcome !== oldInterview.outcome) {
      await Activity.create({
        userId,
        applicationId: oldInterview.applicationId,
        companyName: oldInterview.companyName,
        jobTitle: oldInterview.jobTitle,
        type: 'INTERVIEW_UPDATED',
        description: `${oldInterview.round} interview outcome updated: ${req.body.outcome}`,
        metadata: { outcome: req.body.outcome },
      });
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInterview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid interview ID' });
      return;
    }

    const interview = await Interview.findOneAndDelete({ _id: id, userId });
    if (!interview) {
      res.status(404).json({ success: false, message: 'Interview not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Interview deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
