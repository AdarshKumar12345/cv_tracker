import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
        return;
      }
      next(err);
    }
  };
};

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  targetRole: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  targetRole: z.string().optional(),
  bio: z.string().max(500).optional(),
  themePreference: z.enum(['dark', 'light', 'system']).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export const applicationCreateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  companyId: z.string().optional(),
  jobDescription: z.string().optional(),
  jobLocation: z.string().optional(),
  jobType: z.enum(['Remote', 'Hybrid', 'On-site']).default('Remote'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract']).default('Full-time'),
  salaryRange: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().default('USD'),
      period: z.enum(['yearly', 'monthly', 'hourly']).default('yearly'),
    })
    .optional(),
  jobUrl: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  applicationDate: z.string().optional(),
  deadline: z.string().optional(),
  status: z
    .enum([
      'Wishlist',
      'Applied',
      'Under Review',
      'Online Assessment',
      'Interview Scheduled',
      'Technical Interview',
      'HR Interview',
      'Offer Received',
      'Rejected',
      'Withdrawn',
    ])
    .default('Applied'),
  resumeId: z.string().optional(),
  notes: z.string().optional(),
  recruiterContact: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  tags: z.array(z.string()).default([]),
});

export const applicationStatusUpdateSchema = z.object({
  status: z.enum([
    'Wishlist',
    'Applied',
    'Under Review',
    'Online Assessment',
    'Interview Scheduled',
    'Technical Interview',
    'HR Interview',
    'Offer Received',
    'Rejected',
    'Withdrawn',
  ]),
  statusOrder: z.number().optional(),
});

export const companyCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  website: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  recruiterContacts: z
    .array(
      z.object({
        name: z.string().min(1, 'Recruiter name is required'),
        email: z.string().optional(),
        phone: z.string().optional(),
        role: z.string().optional(),
        linkedin: z.string().optional(),
      })
    )
    .default([]),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).default(3),
});

export const interviewCreateSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  round: z
    .enum(['Screening', 'Technical', 'System Design', 'Behavioral', 'Managerial', 'HR', 'Final'])
    .default('Technical'),
  scheduledAt: z.string().min(1, 'Interview date & time is required'),
  durationMinutes: z.number().default(45),
  interviewType: z.enum(['Video', 'Phone', 'In-person']).default('Video'),
  meetingLink: z.string().optional(),
  interviewerName: z.string().optional(),
  interviewerEmail: z.string().optional(),
  preparationNotes: z.string().optional(),
  questionsAsked: z.array(z.string()).default([]),
  feedback: z.string().optional(),
  outcome: z.enum(['Pending', 'Passed', 'Failed', 'Rescheduled']).default('Pending'),
});
