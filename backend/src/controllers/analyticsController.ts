import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { Application } from '../models/Application';
import { Interview } from '../models/Interview';
import { Activity } from '../models/Activity';
import mongoose from 'mongoose';

export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);

    const [statusCounts, upcomingInterviews, recentActivities, totalCount] =
      await Promise.all([
        Application.aggregate([
          { $match: { userId, isArchived: false } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Interview.find({ userId, scheduledAt: { $gte: new Date() } })
          .sort({ scheduledAt: 1 })
          .limit(5)
          .populate('applicationId', 'companyName jobTitle jobLocation'),
        Activity.find({ userId }).sort({ createdAt: -1 }).limit(8),
        Application.countDocuments({ userId, isArchived: false }),
      ]);

    const countMap: Record<string, number> = {};
    statusCounts.forEach((s) => {
      countMap[s._id] = s.count;
    });

    const wishlist = countMap['Wishlist'] || 0;
    const applied = countMap['Applied'] || 0;
    const underReview = countMap['Under Review'] || 0;
    const assessment = countMap['Online Assessment'] || 0;
    const interviewScheduled =
      (countMap['Interview Scheduled'] || 0) +
      (countMap['Technical Interview'] || 0) +
      (countMap['HR Interview'] || 0);
    const offers = countMap['Offer Received'] || 0;
    const rejected = countMap['Rejected'] || 0;
    const withdrawn = countMap['Withdrawn'] || 0;

    // Derived metrics
    const nonWishlistTotal = totalCount - wishlist;
    const interviewCount = interviewScheduled + offers;
    const interviewConversionRate =
      nonWishlistTotal > 0 ? Math.round((interviewCount / nonWishlistTotal) * 100) : 0;
    const successRate =
      nonWishlistTotal > 0 ? Math.round((offers / nonWishlistTotal) * 100) : 0;

    res.json({
      success: true,
      data: {
        summary: {
          total: totalCount,
          applied,
          underReview,
          assessment,
          interviewScheduled,
          offers,
          rejected,
          withdrawn,
          interviewConversionRate,
          successRate,
        },
        upcomingInterviews,
        recentActivities,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApplicationsOverTime = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const trends = await Application.aggregate([
      {
        $match: {
          userId,
          applicationDate: { $gte: sixMonthsAgo },
          isArchived: false,
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' },
          },
          count: { $sum: 1 },
          offers: {
            $sum: { $cond: [{ $eq: ['$status', 'Offer Received'] }, 1, 0] },
          },
          interviews: {
            $sum: {
              $cond: [
                {
                  $in: [
                    '$status',
                    ['Interview Scheduled', 'Technical Interview', 'HR Interview'],
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format months
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const formattedData = trends.map((t) => ({
      name: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      applications: t.count,
      interviews: t.interviews,
      offers: t.offers,
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getStatusDistribution = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user?.userId);

    const distribution = await Application.aggregate([
      { $match: { userId, isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusColors: Record<string, string> = {
      Wishlist: '#818cf8',
      Applied: '#38bdf8',
      'Under Review': '#fbbf24',
      'Online Assessment': '#f472b6',
      'Interview Scheduled': '#a78bfa',
      'Technical Interview': '#6366f1',
      'HR Interview': '#8b5cf6',
      'Offer Received': '#34d399',
      Rejected: '#f87171',
      Withdrawn: '#94a3b8',
    };

    const formatted = distribution.map((item) => ({
      status: item._id,
      count: item.count,
      color: statusColors[item._id] || '#64748b',
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
