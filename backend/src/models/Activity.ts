import mongoose, { Document, Schema, Types } from 'mongoose';
import { ActivityType } from '../types';

export interface IActivity extends Document {
  userId: Types.ObjectId;
  applicationId?: Types.ObjectId;
  companyName?: string;
  jobTitle?: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
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
      index: true,
    },
    companyName: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'APPLICATION_CREATED',
        'STATUS_CHANGED',
        'INTERVIEW_SCHEDULED',
        'INTERVIEW_UPDATED',
        'RESUME_UPDATED',
        'NOTE_ADDED',
        'OFFER_RECEIVED',
        'APPLICATION_DELETED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

ActivitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
