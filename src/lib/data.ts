import type { User, Recruitment, Application, Promotion } from './types';

export const users: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@unirecruits.com', role: 'admin', password: 'password' },
  { id: '2', name: 'Staff User', email: 'staff@unirecruits.com', role: 'staff', password: 'password' },
  { id: '3', name: 'Dr. Evelyn Reed', email: 'e.reed@unirecruits.com', role: 'staff', password: 'password' },
  { id: '4', name: 'Prof. Samuel Grant', email: 's.grant@unirecruits.com', role: 'staff', password: 'password' },
];

export const recruitments: Recruitment[] = [
  {
    id: 'rec1',
    title: 'Professor of Computer Science',
    department: 'School of Engineering',
    description: 'Seeking a distinguished academic to lead research and teaching in artificial intelligence and machine learning.',
    requirements: ['PhD in Computer Science', '10+ years of research experience', 'Proven track record of publications'],
    closingDate: '2024-08-30',
    status: 'open',
  },
  {
    id: 'rec2',
    title: 'Admissions Officer',
    department: 'Admissions Office',
    description: 'Join our dynamic admissions team to help recruit the next generation of talented students.',
    requirements: ['Bachelor\'s degree', 'Excellent communication skills', 'Experience in higher education administration'],
    closingDate: '2024-08-15',
    status: 'open',
  },
  {
    id: 'rec3',
    title: 'Librarian',
    department: 'University Library',
    description: 'Manage and curate our extensive collection of academic resources and support student research.',
    requirements: ['Master\'s in Library Science', 'Experience with digital archives', 'Strong organizational skills'],
    closingDate: '2024-09-10',
    status: 'open',
  },
    {
    id: 'rec4',
    title: 'Research Assistant',
    department: 'Faculty of Medicine',
    description: 'Support groundbreaking research in molecular biology. This is a 2-year fixed-term contract.',
    requirements: ['BSc in Biology or related field', 'Laboratory experience', 'Data analysis skills'],
    closingDate: '2024-07-30',
    status: 'closed',
  },
];

export const applications: Application[] = [
  {
    id: 'app1',
    recruitmentId: 'rec1',
    recruitmentTitle: 'Professor of Computer Science',
    applicantName: 'Dr. Alice Johnson',
    applicantEmail: 'alice.j@example.com',
    submittedDate: '2024-07-01',
    status: 'reviewed',
  },
  {
    id: 'app2',
    recruitmentId: 'rec2',
    recruitmentTitle: 'Admissions Officer',
    applicantName: 'Bob Williams',
    applicantEmail: 'bob.w@example.com',
    submittedDate: '2024-07-02',
    status: 'pending',
  },
  {
    id: 'app3',
    recruitmentId: 'rec2',
    recruitmentTitle: 'Admissions Officer',
    applicantName: 'Charlie Brown',
    applicantEmail: 'charlie.b@example.com',
    submittedDate: '2024-07-03',
    status: 'pending',
  },
  {
    id: 'app4',
    recruitmentId: 'rec4',
    recruitmentTitle: 'Research Assistant',
    applicantName: 'Diana Prince',
    applicantEmail: 'diana.p@example.com',
    submittedDate: '2024-06-20',
    status: 'hired',
  },
];

export const promotions: Promotion[] = [
  {
    id: 'pro1',
    staffId: '3',
    staffName: 'Dr. Evelyn Reed',
    currentPosition: 'Associate Professor',
    newPosition: 'Full Professor',
    requestDate: '2024-06-15',
    status: 'approved',
  },
  {
    id: 'pro2',
    staffId: '4',
    staffName: 'Prof. Samuel Grant',
    currentPosition: 'Assistant Professor',
    newPosition: 'Associate Professor',
    requestDate: '2024-07-05',
    status: 'pending',
  },
];
