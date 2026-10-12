export type UserRole =
  | 'admin'
  | 'lead_organizer'
  | 'volunteer'
  | 'judge'
  | 'mentor'
  | 'participant';

export type RegistrationStatus =
  | 'pending_review'
  | 'approved'
  | 'waitlisted'
  | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  registrationStatus: RegistrationStatus;
  githubHandle?: string;
  linkedinUrl?: string;
  collegeOrCompany?: string;
  tShirtSize?: string;
  dietaryRestrictions?: string;
  createdAt: string;
}

export type NavigationItemId =
  | 'dashboard'
  | 'participants'
  | 'teams'
  | 'schedule'
  | 'checkin'
  | 'projects'
  | 'judging'
  | 'settings';

export interface NavigationItem {
  id: NavigationItemId;
  label: string;
  href: string;
  iconName: string;
  badge?: string;
  allowedRoles?: UserRole[];
}

export interface MetricCardData {
  id: string;
  label: string;
  value: number | string;
  target?: number | string;
  changeDescription: string;
  status: 'normal' | 'positive' | 'warning';
}

export interface OperationalAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export type HackathonTrack = 'AI' | 'Web3' | 'FinTech' | 'HealthTech' | 'Open Innovation';

export interface TeamMember {
  id: string;
  teamId: string;
  profileId: string;
  joinedAt: string;
  profile?: UserProfile;
}

export interface Team {
  id: string;
  name: string;
  joinCode: string;
  leaderId: string;
  track: HackathonTrack | string;
  projectTitle?: string;
  maxCapacity: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  isCurrentUserLeader?: boolean;
}

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'evaluated';

export interface Submission {
  id: string;
  teamId: string;
  projectTitle: string;
  summary: string;
  repoUrl: string;
  demoUrl?: string;
  videoUrl?: string;
  track: HackathonTrack | string;
  techStack: string[];
  status: SubmissionStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
  team?: Team;
}

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AnnouncementCategory = 'general' | 'schedule' | 'sponsor' | 'emergency';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned: boolean;
  authorId?: string;
  createdAt: string;
}

export interface RubricCriteria {
  id: 'innovation' | 'technical' | 'impact' | 'design';
  label: string;
  maxScore: number;
  weight: number;
  description: string;
}

export interface EvaluationScore {
  innovation: number;   // 1 - 25
  technical: number;    // 1 - 25
  impact: number;       // 1 - 25
  design: number;       // 1 - 25
  feedback?: string;
}

export interface ProjectEvaluation {
  id: string;
  submissionId: string;
  judgeId: string;
  scores: EvaluationScore;
  totalScore: number;   // Out of 100
  submittedAt: string;
  judgeName?: string;
}


