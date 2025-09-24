export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  role: "admin" | "staff" | "user";
  dateOfEmployment?: Date;
  promotionStatus?: string;
  currentLevel?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recruitment {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  closingDate: string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  recruitmentId: string;
  applicantName: string;
  email: string;
  resumeUrl: string;
  coverLetter?: string;
  status: "submitted" | "reviewed" | "shortlisted" | "rejected";
  createdAt: string;
  updatedAt: string;
  recruitment?: Recruitment;
}

export interface Promotion {
  id: string;
  staffId: string;
  staffName: string;
  currentPosition: string;
  newPosition: string;
  requestDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}
