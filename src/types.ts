export interface ResumeVersion {
  id: string;
  fileName: string;
  uploadDate: string;
  atsScore: number;
  analysis: ResumeAnalysis;
  resumeText?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'admin';
  name: string;
  rollNumber?: string;
  department?: string;
  year?: string;
  cgpa?: number;
  skills?: string[];
  phone?: string;
  linkedin?: string;
  github?: string;
  resumeText?: string;
  resumeFileName?: string;
  dailyStreak: number;
  codingScore: number;
  aptitudeScore: number;
  overallProgress: number;
  lastActive: string;
  resumeAnalysis?: ResumeAnalysis;
  resumeVersions?: ResumeVersion[];
}

export interface ResumeAnalysis {
  atsScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  checklist: { item: string; status: boolean }[];
}

export interface Company {
  id: string;
  name: string;
  package: string;
  eligibilityCgpa: number;
  requiredSkills: string[];
  registrationDeadline: string;
  interviewDate: string;
  description?: string;
  location?: string;
  applicationStatus: 'Not Applied' | 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  applicationDate?: string;
  applicationNotes?: string;
}

export interface CodingQuestion {
  id: string;
  title: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  boilerplate: string;
  testCases: { input: string; output: string }[];
  points: number;
  status: 'Unsolved' | 'Attempted' | 'Solved';
}

export interface AptitudeQuestion {
  id: string;
  section: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface PlannerTask {
  id: string;
  studentId: string;
  title: string;
  completed: boolean;
  date: string;
  voiceNotes?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  department: string;
  codingScore: number;
  aptitudeScore: number;
  dailyStreak: number;
  overallProgress: number;
  totalScore: number;
  rank: number;
}

export interface SystemNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'HR' | 'System Design';
  question: string;
  sampleAnswer: string;
}

export interface PlacementReadiness {
  readinessScore: number;
  skillGapAnalysis: {
    strengths: string[];
    gaps: string[];
    recommendations: string[];
  };
  smartStudyPlan: {
    phase: string;
    tasks: string[];
  }[];
  companyRecommendations: {
    companyName: string;
    reason: string;
  }[];
  aiDailyQuestion: {
    question: string;
    hints: string[];
  };
}

export interface HistoryItem {
  id: string;
  studentId: string;
  actionType: "coding" | "aptitude" | "resume" | "planner" | "interview" | "profile" | "application" | string;
  description: string;
  timestamp: string;
  metadata?: any;
}
