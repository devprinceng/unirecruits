"use client";
import { useParams, useRouter } from 'next/navigation';
import { applications, recruitments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, University, Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminRecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const recruitment = recruitments.find((r) => r.id === id);
  const relevantApplications = applications.filter(a => a.recruitmentId === id);

  if (!recruitment) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <h1 className="text-2xl font-bold">Recruitment not found</h1>
        <p className="text-muted-foreground">The job opening you are looking for does not exist.</p>
        <Button onClick={() => router.push('/admin/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }
  
  const stats = {
    total: relevantApplications.length,
    pending: relevantApplications.filter(a => a.status === 'pending').length,
    reviewed: relevantApplications.filter(a => a.status === 'reviewed').length,
    hired: relevantApplications.filter(a => a.status === 'hired').length,
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        &larr; Back to Dashboard
      </Button>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                <CardTitle className="text-3xl font-bold">{recruitment.title}</CardTitle>
                <CardDescription className="flex items-center pt-2 text-base">
                    <University className="mr-2 h-5 w-5" /> {recruitment.department}
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Job Description</h2>
                    <p className="text-muted-foreground">{recruitment.description}</p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-2">Requirements</h2>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {recruitment.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                    ))}
                    </ul>
                </div>
                <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Closing Date: {new Date(recruitment.closingDate).toLocaleDateString()}</span>
                </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>All applications submitted for this role.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Applicant Name</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {relevantApplications.map((app) => (
                            <TableRow key={app.id}>
                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                            <TableCell>{app.submittedDate}</TableCell>
                            <TableCell><Badge variant="outline">{app.status}</Badge></TableCell>
                            <TableCell className="text-right">
                                <Select defaultValue={app.status}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Update..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="hired">Hired</SelectItem>
                                </SelectContent>
                                </Select>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Recruitment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><FileText className="mr-2 h-4 w-4"/>Status</span>
                        <Badge variant={recruitment.status === 'open' ? 'default' : 'secondary'}>{recruitment.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4"/>Total Applications</span>
                        <span className="font-semibold">{stats.total}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4"/>Pending Review</span>
                        <span className="font-semibold">{stats.pending}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-blue-500"/>Reviewed</span>
                        <span className="font-semibold">{stats.reviewed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-green-500"/>Hired</span>
                        <span className="font-semibold">{stats.hired}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
