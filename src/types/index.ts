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
  checkedInAt?: string;
  checkedInBy?: string;
}

export type NavigationItemId =
  | 'dashboard'
  | 'profile'
  | 'participants'
  | 'teams'
  | 'schedule'
  | 'announcements'
  | 'checkin'
  | 'projects'
  | 'judging'
  | 'results'
  | 'settings'
  | 'mentoring';

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

export type SubmissionStatus = 'draft' | 'submitted' | 'under_review' | 'scored' | 'evaluated';

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

// ------------------------------------------------------------------------------
// Rubric & Evaluations (Batch 2 Database-Backed Judging Engine)
// ------------------------------------------------------------------------------

export interface RubricCriterion {
  id: string;
  label: string;
  maxScore: number;
  weight: number;
  description: string;
}

export type RubricCriteria = RubricCriterion;

export interface EvaluationScore {
  innovation: number;
  technical: number;
  design?: number;
  impact?: number;
  viability?: number;
  presentation?: number;
  feedback?: string;
  [key: string]: number | string | undefined;
}

export type EvaluationStatus = 'draft' | 'submitted';

export interface Evaluation {
  id: string;
  submissionId: string;
  judgeId: string;
  scores: EvaluationScore;
  totalScore: number;
  feedback?: string;
  status?: EvaluationStatus;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  judgeName?: string;
}

export type ProjectEvaluation = Evaluation;

export interface JudgeAssignment {
  id: string;
  judgeId: string;
  submissionId: string;
  assignedBy?: string;
  createdAt: string;
  judge?: UserProfile;
  submission?: Submission;
}

// ------------------------------------------------------------------------------
// Event Settings (Batch 2 Authoritative Configuration)
// ------------------------------------------------------------------------------

export interface EventSettings {
  id: string;
  eventName: string;
  shortDescription: string;
  longDescription: string;
  organizerName: string;
  contactEmail: string;
  timezone: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  submissionDeadline: string;
  venue: string;
  isVenueConfirmed: boolean;
  capacityLimit: number;
  minTeamSize: number;
  maxTeamSize: number;
  paymentEnabled: boolean;
  resultsPublished: boolean;
  judgingRubric: RubricCriterion[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------------------------------
// Schedule Items (Batch 2 Database-Backed Schedule)
// ------------------------------------------------------------------------------

export type ScheduleCategory = 'ceremony' | 'hacking' | 'food' | 'mentoring' | 'judging';

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location: string;
  category: ScheduleCategory;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  // Legacy display compatibility
  day?: string;
  time?: string;
}

// ------------------------------------------------------------------------------
// Mentor Requests (Batch 2 Mentoring System)
// ------------------------------------------------------------------------------

export type MentorRequestStatus = 'open' | 'assigned' | 'in_progress' | 'resolved';

export interface MentorRequest {
  id: string;
  teamId: string;
  requesterId: string;
  topic: string;
  description: string;
  status: MentorRequestStatus;
  assignedMentorId?: string;
  createdAt: string;
  resolvedAt?: string;
  team?: Team;
  requester?: UserProfile;
  assignedMentor?: UserProfile;
}

// ------------------------------------------------------------------------------
// Tasks & Audit Logs (Batch 2 Operations)
// ------------------------------------------------------------------------------

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  assignee?: UserProfile;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, unknown>;
  createdAt: string;
  actor?: UserProfile;
}
