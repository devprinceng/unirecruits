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
import { applications, promotions, recruitments, users } from "@/lib/data";
import type { Recruitment, User, Application, Promotion } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SkillClassifier } from "@/components/skill-classifier";
import { PlusCircle, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";


export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [openNewRecruitmentDialog, setOpenNewRecruitmentDialog] = useState(false);
  const [openAddStaffDialog, setOpenAddStaffDialog] = useState(false);

  // Form state for new recruitment
  const [newRecruitmentTitle, setNewRecruitmentTitle] = useState('');
  const [newRecruitmentDept, setNewRecruitmentDept] = useState('');
  const [newRecruitmentDesc, setNewRecruitmentDesc] = useState('');
  const [classifiedSkills, setClassifiedSkills] = useState<string[]>([]);
  
   // Form state for new staff
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
    role: 'staff' as 'staff' | 'admin',
    dateOfEmployment: '',
    promotionStatus: 'Eligible' as 'Eligible' | 'Promoted' | 'Not Eligible' | 'Top Level',
    currentLevel: '',
  });

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  const handleAddStaffChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewStaff(prev => ({ ...prev, [id]: value }));
  };

  const handleAddStaffSelectChange = (id: string, value: string) => {
    setNewStaff(prev => ({ ...prev, [id]: value }));
  };


  const handleCreateRecruitment = () => {
    // In a real app, you'd send this to an API
    console.log({
      title: newRecruitmentTitle,
      department: newRecruitmentDept,
      description: newRecruitmentDesc,
      requirements: classifiedSkills
    });

    toast({
      title: "Recruitment Created",
      description: `${newRecruitmentTitle} has been posted.`,
    });

    // Reset form and close dialog
    setNewRecruitmentTitle('');
    setNewRecruitmentDept('');
    setNewRecruitmentDesc('');
    setClassifiedSkills([]);
    setOpenNewRecruitmentDialog(false);
  }
  
  const handleAddStaff = () => {
    console.log(newStaff);
    toast({
        title: "Staff Added",
        description: `${newStaff.firstName} ${newStaff.lastName} has been added to the system.`,
    });
    setOpenAddStaffDialog(false);
    // Reset form
    setNewStaff({
        firstName: '', lastName: '', email: '', password: '', phone: '',
        department: '', designation: '', role: 'staff', dateOfEmployment: '',
        promotionStatus: 'Eligible', currentLevel: '',
    });
  }


  if (loading || !user || user.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isClient) {
    return null;
  }
  
  const staffMembers = users.filter(u => u.role === 'staff');

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user.firstName}. Manage UniRecruits system here.</p>
      </header>

      <Tabs defaultValue="recruitments">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recruitments">Recruitments</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

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
                      Fill in the details for the new job opening. Use the AI tool to classify skills.
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
                  </div>
                  <SkillClassifier 
                    jobDescription={newRecruitmentDesc}
                    setJobDescription={setNewRecruitmentDesc}
                    onSkillsClassified={setClassifiedSkills} 
                  />
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
                      <TableCell>{r.closingDate}</TableCell>
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

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Review Applications</CardTitle>
              <CardDescription>Review submitted applications for all job openings.</CardDescription>
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
                      <TableCell>{app.recruitmentTitle}</TableCell>
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
        </TabsContent>
        
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
                      <TableCell>{p.requestDate}</TableCell>
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
                                <Input id="dateOfEmployment" type="date" value={newStaff.dateOfEmployment} onChange={handleAddStaffChange} />
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
