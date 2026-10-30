import mongoose, { Document, Schema, Types } from 'mongoose';
import { InterviewOutcome, InterviewRound } from '../types';

export interface IInterview extends Document {
  userId: Types.ObjectId;
  applicationId: Types.ObjectId;
  companyName: string;
  jobTitle: string;
  round: InterviewRound;
  scheduledAt: Date;
  durationMinutes: number;
  interviewType: 'Video' | 'Phone' | 'In-person';
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  preparationNotes?: string;
  questionsAsked: string[];
  feedback?: string;
  outcome: InterviewOutcome;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    round: {
      type: String,
      enum: ['Screening', 'Technical', 'System Design', 'Behavioral', 'Managerial', 'HR', 'Final'],
      default: 'Technical',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview date and time is required'],
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    interviewType: {
      type: String,
      enum: ['Video', 'Phone', 'In-person'],
      default: 'Video',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    interviewerName: {
      type: String,
      trim: true,
      default: '',
    },
    interviewerEmail: {
      type: String,
      trim: true,
      default: '',
    },
    preparationNotes: {
      type: String,
      default: '',
    },
    questionsAsked: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      default: '',
    },
    outcome: {
      type: String,
      enum: ['Pending', 'Passed', 'Failed', 'Rescheduled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

InterviewSchema.index({ userId: 1, scheduledAt: 1 });

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
