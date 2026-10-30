import { Request } from 'express';
import { Types } from 'mongoose';

export interface IUserPayload {
  userId: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserPayload;
}

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'Under Review'
  | 'Online Assessment'
  | 'Interview Scheduled'
  | 'Technical Interview'
  | 'HR Interview'
  | 'Offer Received'
  | 'Rejected'
  | 'Withdrawn';

export type JobType = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export type InterviewRound =
  | 'Screening'
  | 'Technical'
  | 'System Design'
  | 'Behavioral'
  | 'Managerial'
  | 'HR'
  | 'Final';

export type InterviewOutcome = 'Pending' | 'Passed' | 'Failed' | 'Rescheduled';

export type ActivityType =
  | 'APPLICATION_CREATED'
  | 'STATUS_CHANGED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_UPDATED'
  | 'RESUME_UPDATED'
  | 'NOTE_ADDED'
  | 'OFFER_RECEIVED'
  | 'APPLICATION_DELETED';
