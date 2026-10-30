import mongoose, { Document, Schema, Types } from 'mongoose';
import { ApplicationStatus, EmploymentType, JobType, PriorityLevel } from '../types';

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface IApplicationRecruiter {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface IApplication extends Document {
  userId: Types.ObjectId;
  companyId?: Types.ObjectId;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  jobType: JobType;
  employmentType: EmploymentType;
  salaryRange?: ISalaryRange;
  jobUrl?: string;
  applicationDate: Date;
  deadline?: Date;
  status: ApplicationStatus;
  statusOrder: number;
  resumeId?: Types.ObjectId;
  notes?: string;
  recruiterContact?: IApplicationRecruiter;
  priority: PriorityLevel;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SalaryRangeSchema = new Schema<ISalaryRange>(
  {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
  },
  { _id: false }
);

const RecruiterSchema = new Schema<IApplicationRecruiter>(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    jobLocation: {
      type: String,
      trim: true,
      default: '',
    },
    jobType: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Remote',
    },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    salaryRange: {
      type: SalaryRangeSchema,
      default: () => ({ currency: 'USD', period: 'yearly' }),
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    applicationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
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
      ],
      default: 'Applied',
      index: true,
    },
    statusOrder: {
      type: Number,
      default: 0,
    },
    resumeId: {
      type: Schema.Types.ObjectId,
      ref: 'Resume',
    },
    notes: {
      type: String,
      default: '',
    },
    recruiterContact: {
      type: RecruiterSchema,
      default: {},
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, applicationDate: -1 });
ApplicationSchema.index({ userId: 1, companyName: 1 });
ApplicationSchema.index({ userId: 1, jobTitle: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
