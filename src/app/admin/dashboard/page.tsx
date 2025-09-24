"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Recruitment, User, Application, Promotion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchRecruitments, fetchApplications, fetchPromotions, fetchUsers, createRecruitment, createUser, updateApplicationStatus, getStats } from "@/lib/api";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [openNewRecruitmentDialog, setOpenNewRecruitmentDialog] = useState(false);
  const [openAddStaffDialog, setOpenAddStaffDialog] = useState(false);

  // Data states
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<{
    promotions: number;
    recruitments: number;
    staffs: number;
    applications: number;
  } | null>(null);

  // Form state for new recruitment
  const [newRecruitmentTitle, setNewRecruitmentTitle] = useState('');
  const [newRecruitmentDept, setNewRecruitmentDept] = useState('');
  const [newRecruitmentDesc, setNewRecruitmentDesc] = useState('');
  const [newRecruitmentReqs, setNewRecruitmentReqs] = useState('');

   // Form state for new staff
  const [newStaff, setNewStaff] = useState<Partial<User> & { password?: string }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '0000000000',
    department: '',
    designation: '',
    role: 'staff',
    dateOfEmployment: new Date(),
    promotionStatus: 'Eligible',
    currentLevel: '',
    resumeUrl: ''
  });

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadData() {
        setRecruitments(await fetchRecruitments());
        setApplications(await fetchApplications());
        setPromotions(await fetchPromotions());
        setUsers(await fetchUsers());
        setStats(await getStats());
    }

    if(user?.role === 'admin') {
      loadData();
      console.log("applications", applications);
    }
  }, [user]);

  const handleAddStaffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'dateOfEmployment') {
      setNewStaff(prev => ({ ...prev, [id]: new Date(value) }));
    } else {
      setNewStaff(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleAddStaffSelectChange = (id: string, value: string) => {
    setNewStaff(prev => ({ ...prev, [id]: value as any }));
  };


  const handleCreateRecruitment = async () => {
    const newRec: Omit<Recruitment, 'id' | 'status'> = {
      title: newRecruitmentTitle,
      department: newRecruitmentDept,
      description: newRecruitmentDesc,
      requirements: newRecruitmentReqs.split('\\n'),
      closingDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], // Default 30 days
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
        const created = await createRecruitment(newRec);
        setRecruitments(prev => [created, ...prev]);
        toast({
          title: "Recruitment Created",
          description: `${created.title} has been posted.`,
        });
        setOpenNewRecruitmentDialog(false);
        // Reset form
        setNewRecruitmentTitle('');
        setNewRecruitmentDept('');
        setNewRecruitmentDesc('');
        setNewRecruitmentReqs('');
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to create recruitment.",
            variant: "destructive"
        });
    }
  }

  const handleAddStaff = async () => {
    // In a real app, you would handle file uploads to a server/storage
    // and get a URL back. For now, we'll simulate this.
    const resumeInput = document.getElementById('resumeUrl') as HTMLInputElement;
    if (resumeInput.files && resumeInput.files[0]) {
        const fileName = resumeInput.files[0].name;
        newStaff.resumeUrl = `/resumes/${fileName}`; // Mock URL
    }

    try {
        const created = await createUser(newStaff);
        setUsers(prev => [created, ...prev]);
        toast({
            title: "Staff Added",
            description: `${created.firstName} ${created.lastName} has been added to the system.`,
        });
        setOpenAddStaffDialog(false);
        // Reset form
        setNewStaff({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: '0000000000',
            department: '',
            designation: '',
            role: 'staff',
            dateOfEmployment: new Date(),
            promotionStatus: 'Eligible',
            currentLevel: '',
            resumeUrl: ''
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to add staff.",
            variant: "destructive"
        });
    }
  }

  const handleApplicationStatusChange = async (appId: string, status: Application['status']) => {
    try {
        await updateApplicationStatus(appId, status);
        setApplications(prev => prev.map(app => app.id === appId ? {...app, status} : app));
        toast({
            title: "Status Updated",
            description: "Application status has been updated.",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update status.",
            variant: "destructive"
        });
    }
  };


  if (loading || !user || user.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.firstName}. Manage UniRecruits system here.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="m22 21-3-3m0 0a5 5 0 1 0-7-7 5 5 0 0 0 7 7Z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.staffs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total staff members
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total applications received
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recruitments</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recruitments || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active recruitment posts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotion Requests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.promotions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pending promotion requests
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recruitments">
        <ScrollArea className="w-full whitespace-nowrap">
          <TabsList className="grid w-full grid-cols-4 min-w-[600px]">
            <TabsTrigger value="recruitments">Recruitments</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>


        <TabsContent value="recruitments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Recruitments</CardTitle>
                <CardDescription>View, create, and manage job openings.</CardDescription>
              </div>
              <Dialog open={openNewRecruitmentDialog} onOpenChange={setOpenNewRecruitmentDialog}>
                <DialogTrigger asChild>
                  <Button><PlusCircle className="mr-2 h-4 w-4"/>New Recruitment</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Recruitment</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new job opening.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Title</Label>
                      <Input id="title" value={newRecruitmentTitle} onChange={e => setNewRecruitmentTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="department" className="text-right">Department</Label>
                      <Input id="department" value={newRecruitmentDept} onChange={e => setNewRecruitmentDept(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Input id="description" value={newRecruitmentDesc} onChange={e => setNewRecruitmentDesc(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="requirements" className="text-right">Requirements</Label>
                      <Input id="requirements" value={newRecruitmentReqs} onChange={e => setNewRecruitmentReqs(e.target.value)} className="col-span-3" placeholder="Enter one per line"/>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOpenNewRecruitmentDialog(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleCreateRecruitment}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruitments.map((r: Recruitment) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell>{r.department}</TableCell>
                      <TableCell>{new Date(r.closingDate).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant={r.status === 'open' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/recruitments/${r.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {(applications.length > 0 ) && <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Review Applications</CardTitle>
              <CardDescription>Review submitted applications for all Recruitments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app: Application) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.applicantName}</TableCell>
                      {/* <TableCell>{app.recruitmentTitle}</TableCell> */}
                      <TableCell>{app.recruitment?.title}</TableCell>
                      <TableCell>{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{app.status}</Badge></TableCell>
                       <TableCell className="text-right">
                        <Select onValueChange={(value) => handleApplicationStatusChange(app.id, value as Application['status'])} defaultValue={app.status}>
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
        </TabsContent>}
        
        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Manage Promotion Requests</CardTitle>
              <CardDescription>Approve or reject promotion requests from staff.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Current Position</TableHead>
                    <TableHead>Requested Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((p: Promotion) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.staffName}</TableCell>
                      <TableCell>{p.currentPosition}</TableCell>
                      <TableCell>{p.newPosition}</TableCell>
                      <TableCell>{new Date(p.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                      <TableCell className="text-right">
                         <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/promotions/${p.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Manage Staff</CardTitle>
                    <CardDescription>View and add staff members to the system.</CardDescription>
                </div>
                 <Dialog open={openAddStaffDialog} onOpenChange={setOpenAddStaffDialog}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Staff</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Fill in the details to add a new staff member.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" value={newStaff.firstName} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" value={newStaff.lastName} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={newStaff.email} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={newStaff.password} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={newStaff.phone} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" value={newStaff.department} onChange={handleAddStaffChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="designation">Designation</Label>
                                <Input id="designation" value={newStaff.designation} onChange={handleAddStaffChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="currentLevel">Current Level</Label>
                                <Input id="currentLevel" value={newStaff.currentLevel} onChange={handleAddStaffChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="dateOfEmployment">Date of Employment</Label>
                                <Input id="dateOfEmployment" type="date" value={newStaff.dateOfEmployment ? new Date(newStaff.dateOfEmployment).toISOString().split('T')[0] : ''} onChange={handleAddStaffChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select onValueChange={(value) => handleAddStaffSelectChange('role', value)} defaultValue={newStaff.role}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="promotionStatus">Promotion Status</Label>
                                <Select onValueChange={(value) => handleAddStaffSelectChange('promotionStatus', value)} defaultValue={newStaff.promotionStatus}>
                                     <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Eligible">Eligible</SelectItem>
                                        <SelectItem value="Promoted">Promoted</SelectItem>
                                        <SelectItem value="Not Eligible">Not Eligible</SelectItem>
                                        <SelectItem value="Top Level">Top Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="resumeUrl">Resume/CV</Label>
                                <Input id="resumeUrl" type="file" />
                                <p className="text-xs text-muted-foreground">Upload resume in PDF format.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setOpenAddStaffDialog(false)}>Cancel</Button>
                            <Button onClick={handleAddStaff}>Add Staff</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((s: User) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.firstName} {s.lastName}</TableCell>
                      <TableCell>{s.email}</TableCell>
                       <TableCell>{s.department}</TableCell>
                      <TableCell>{s.designation}</TableCell>
                      <TableCell>{s.currentLevel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
