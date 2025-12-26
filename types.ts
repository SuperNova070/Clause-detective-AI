
export type AccessLevel = 'free' | 'premium';
export type UserRole = 'user' | 'admin';
export type AdminRole = 'admin' | 'super_admin';
export type PaymentStatus = 'not_started' | 'pending' | 'successful' | 'failed';

export interface UserProfile {
  email: string;
  role: UserRole;
  adminRole?: AdminRole;
  accessLevel: AccessLevel;
  paymentStatus?: PaymentStatus;
}

export interface ConsultationSlot {
  id: string;
  date: string;
  time: string;
}

export interface AnalysisReview {
  userId: string;
  contractType: string;
  analysisOutput: string;
  accessLevel: AccessLevel;
  timestamp: string;
}

export interface AnalysisResult {
  overview: string;
  clauses: string;
  riskAnalysis: string;
  premiumDeepAnalysis?: string;
  upgradePrompt?: string;
  practicalAdvice: string;
  summary: string;
  disclaimer: string;
}

export enum ContractType {
  RENTAL = 'Rental Agreement',
  EMPLOYMENT = 'Employment Contract',
  OTHER = 'Other'
}
