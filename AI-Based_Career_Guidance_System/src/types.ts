/**
 * CareerAI Pro Shared Types & Interfaces
 */

export type UserRole = 'student' | 'counselor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  academicBackground?: string;
  skills: string[];
  interests: string[];
  careerGoals: string;
  profileCompleted: boolean;
  mbti?: string;
  bigFive?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  aptitudeScore?: number;
  isVerified?: boolean;
  registeredAt?: string;
  accountStatus?: string;
}

export interface AssessmentQuestion {
  id: string;
  category: 'personality' | 'aptitude' | 'interests' | 'skills';
  type: 'mbti' | 'bigfive' | 'aptitude' | 'interests' | 'skills';
  questionText: string;
  options: {
    label: string;
    value: string; // e.g., 'E', 'I', 'A', 'B', 'C', 'D'
  }[];
  correctOption?: string; // For aptitude questions
}

export interface AssessmentSubmission {
  mbtiAnswers: Record<string, string>; // questionId -> E/I, S/N, T/F, J/P
  bigFiveAnswers: Record<string, number>; // questionId -> 1 to 5 rating
  aptitudeAnswers: Record<string, string>; // questionId -> selected option
  skillsSelected: string[];
  interestsSelected: string[];
}

export interface CareerRecommendation {
  careerId: string;
  name: string;
  description: string;
  matchScore: number;
  demandScore: number;
  salaryScore: number;
  growthScore: number;
  overallScore: number;
  requiredSkills: string[];
  educationPath: string[];
  salaryRange: string;
  futureScope: string;
  growthTrends: string;
  relatedCareers: string[];
}

export interface CareerExplorer {
  name: string;
  description: string;
  requiredSkills: string[];
  educationPath: string[];
  salaryRange: string;
  futureScope: string;
  growthTrends: string;
  demandScore: number;
  relatedCareers: string[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "Week 1-2"
  resources: { name: string; url: string }[];
  projects: string[];
  certifications: string[];
  skillMilestones: string[];
}

export interface LearningRoadmap {
  careerName: string;
  durationType: '30day' | '90day' | '6month' | '1year';
  steps: RoadmapStep[];
  aiGuidance?: string;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  skillGap: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  suggestions: string[];
  careerAlignment: string;
}

export interface MockInterviewQuestion {
  id: string;
  question: string;
  category: 'technical' | 'behavioral';
  expectedConcepts: string[];
}

export interface MockInterviewFeedback {
  score: number;
  questionId: string;
  questionText: string;
  userAnswer: string;
  strength: string;
  improvement: string;
  sampleAnswer: string;
}

export interface InterviewSession {
  sessionId: string;
  questions: MockInterviewQuestion[];
  currentQuestionIndex: number;
  feedbacks: MockInterviewFeedback[];
  overallSummary?: string;
}

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryRange: string;
  skillsRequired: string[];
  applyLink: string;
}

export interface UniversityRecommendation {
  id: string;
  name: string;
  location: string;
  courses: string[];
  eligibility: string;
  fees: string;
  scholarships: string[];
  placementStatistics: string;
}

export interface ScholarshipRecommendation {
  id: string;
  name: string;
  criteria: string;
  amount: string;
  coverage: string;
  eligibility: string;
  deadline: string;
}

export interface CounselorSession {
  id: string;
  studentId: string;
  studentName: string;
  counselorId: string;
  counselorName: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
}

export interface Counselor {
  id: string;
  name: string;
  email: string;
  specialization: string[];
  rating: number;
  avatar?: string;
}
