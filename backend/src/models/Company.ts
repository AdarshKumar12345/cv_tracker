import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IRecruiterContact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  linkedin?: string;
}

export interface ICompany extends Document {
  userId: Types.ObjectId;
  name: string;
  website?: string;
  description?: string;
  location?: string;
  industry?: string;
  recruiterContacts: IRecruiterContact[];
  notes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RecruiterContactSchema = new Schema<IRecruiterContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    role: { type: String, trim: true },
    linkedin: { type: String, trim: true },
  },
  { _id: true }
);

const CompanySchema = new Schema<ICompany>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 120,
      index: true,
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: '',
    },
    recruiterContacts: {
      type: [RecruiterContactSchema],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

CompanySchema.index({ userId: 1, name: 1 });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
