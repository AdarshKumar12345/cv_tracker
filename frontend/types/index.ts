export interface User {
  id: string;
  name: string;
  email: string;
  targetRole?: string;
  bio?: string;
  themePreference: 'dark' | 'light' | 'system';
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

export interface SalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface RecruiterContact {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  linkedin?: string;
}

export interface Application {
  _id: string;
  userId: string;
  companyId?: string | {
    _id: string;
    name: string;
    website?: string;
    logoUrl?: string;
    location?: string;
  };
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  jobLocation?: string;
  jobType: JobType;
  employmentType: EmploymentType;
  salaryRange?: SalaryRange;
  jobUrl?: string;
  applicationDate: string;
  deadline?: string;
  status: ApplicationStatus;
  statusOrder: number;
  resumeId?: string | {
    _id: string;
    title: string;
    fileName: string;
    originalName: string;
    version: number;
  };
  notes?: string;
  recruiterContact?: RecruiterContact;
  priority: PriorityLevel;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  _id: string;
  userId: string;
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
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  userId: string;
  name: string;
  website?: string;
  description?: string;
  location?: string;
  industry?: string;
  recruiterContacts: RecruiterContact[];
  notes?: string;
  rating?: number;
  applicationCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type InterviewRound =
  | 'Screening'
  | 'Technical'
  | 'System Design'
  | 'Behavioral'
  | 'Managerial'
  | 'HR'
  | 'Final';

export type InterviewOutcome = 'Pending' | 'Passed' | 'Failed' | 'Rescheduled';

export interface Interview {
  _id: string;
  userId: string;
  applicationId: string | {
    _id: string;
    companyName: string;
    jobTitle: string;
    status: ApplicationStatus;
    jobLocation?: string;
    salaryRange?: SalaryRange;
  };
  companyName: string;
  jobTitle: string;
  round: InterviewRound;
  scheduledAt: string;
  durationMinutes: number;
  interviewType: 'Video' | 'Phone' | 'In-person';
  meetingLink?: string;
  interviewerName?: string;
  interviewerEmail?: string;
  preparationNotes?: string;
  questionsAsked: string[];
  feedback?: string;
  outcome: InterviewOutcome;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  userId: string;
  applicationId?: string | {
    _id: string;
    companyName: string;
    jobTitle: string;
    status: ApplicationStatus;
  };
  companyName?: string;
  jobTitle?: string;
  type: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DashboardStats {
  summary: {
    total: number;
    applied: number;
    underReview: number;
    assessment: number;
    interviewScheduled: number;
    offers: number;
    rejected: number;
    withdrawn: number;
    interviewConversionRate: number;
    successRate: number;
  };
  upcomingInterviews: Interview[];
  recentActivities: Activity[];
}
