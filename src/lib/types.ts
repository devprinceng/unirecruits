export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
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
