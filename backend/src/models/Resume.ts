import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IResume extends Document {
  userId: Types.ObjectId;
  title: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  version: number;
  isDefault: boolean;
  skills: string[];
  parsedSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      maxlength: 120,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: [String],
      default: [],
    },
    parsedSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ResumeSchema.index({ userId: 1, isDefault: 1 });

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
