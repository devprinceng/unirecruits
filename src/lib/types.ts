export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role: 'admin' | 'staff';
  dateOfEmployment: string;
  promotionStatus: 'Eligible' | 'Promoted' | 'Not Eligible' | 'Top Level';
  currentLevel: string;
  password?: string;
};

export type Recruitment = {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  closingDate: string;
  status: 'open' | 'closed';
};

export type Application = {
  id: string;
  recruitmentId: string;
  recruitmentTitle: string;
  applicantName: string;
  applicantEmail: string;
  submittedDate: string;
  status: 'pending' | 'reviewed' | 'rejected' | 'hired';
};

export type Promotion = {
  id: string;
  staffId: string;
  staffName: string;
  currentPosition: string;
  newPosition: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
};
