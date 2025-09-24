"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchAdminStaffs, updateAdminStaff, deleteAdminStaff, createUser } from "@/lib/api";
import type { User } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminStaffPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [newStaffData, setNewStaffData] = useState<Partial<User> & { password?: string }>({
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
  });

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadStaff() {
      try {
        const data = await fetchAdminStaffs();
        setStaffMembers(data);
      } catch (error) {
        console.error("Failed to load staff:", error);
        toast({
          title: "Error",
          description: "Failed to load staff members",
          variant: "destructive",
        });
      }
    }

    if (user?.role === 'admin') {
      loadStaff();
    }
  }, [user, toast]);

  const handleEditStaff = (staff: User) => {
    setSelectedStaff(staff);
    setEditFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone,
      department: staff.department,
      designation: staff.designation,
      promotionStatus: staff.promotionStatus,
      currentLevel: staff.currentLevel,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return;

    try {
      const updatedStaff = await updateAdminStaff(selectedStaff.id, editFormData);
      
      setStaffMembers(prev => 
        prev.map(staff => 
          staff.id === selectedStaff.id 
            ? { ...staff, ...editFormData }
            : staff
        )
      );

      toast({
        title: "Success",
        description: "Staff member updated successfully",
      });

      setIsEditDialogOpen(false);
      setSelectedStaff(null);
    } catch (error) {
      console.error("Failed to update staff:", error);
      toast({
        title: "Error",
        description: "Failed to update staff member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    try {
      await deleteAdminStaff(staffId);
      
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));

      toast({
        title: "Success",
        description: "Staff member deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete staff:", error);
      toast({
        title: "Error",
        description: "Failed to delete staff member",
        variant: "destructive",
      });
    }
  };

  const handleAddStaff = async () => {
    try {
      const newStaff = await createUser(newStaffData);
      
      setStaffMembers(prev => [...prev, newStaff]);

      toast({
        title: "Success",
        description: "Staff member added successfully",
      });

      setIsAddDialogOpen(false);
      setNewStaffData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '0000000000',
        department: '',
        designation: '',
        role: 'staff',
        dateOfEmployment: new Date(),
        promotionStatus: 'Eligible',
        currentLevel: '',
      });
    } catch (error) {
      console.error("Failed to add staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member",
        variant: "destructive",
      });
    }
  };

  const getPromotionStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const colors = {
      "Eligible": "bg-green-100 text-green-800",
      "Promoted": "bg-blue-100 text-blue-800",
      "Not Eligible": "bg-red-100 text-red-800",
      "Top Level": "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  if (loading || !isClient) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage all staff members</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Staff
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Staff Members</CardTitle>
          <CardDescription>
            View and manage all staff members
          </CardDescription>
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
                <TableHead>Promotion Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.filter(staff => staff.role === 'staff').map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    {staff.firstName} {staff.lastName}
                  </TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.designation}</TableCell>
                  <TableCell>{staff.currentLevel}</TableCell>
                  <TableCell>{getPromotionStatusBadge(staff.promotionStatus)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditStaff(staff)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStaff(staff.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {staffMembers.filter(staff => staff.role === 'staff').length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editFormData.firstName || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editFormData.lastName || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={editFormData.department || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={editFormData.designation || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, designation: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="currentLevel">Current Level</Label>
              <Input
                id="currentLevel"
                value={editFormData.currentLevel || ''}
                onChange={(e) => setEditFormData(prev => ({ ...prev, currentLevel: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="promotionStatus">Promotion Status</Label>
              <Select 
                value={editFormData.promotionStatus || ''} 
                onValueChange={(value) => setEditFormData(prev => ({ ...prev, promotionStatus: value as User['promotionStatus'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStaff}>
              Update Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff member account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newFirstName">First Name</Label>
                <Input
                  id="newFirstName"
                  value={newStaffData.firstName || ''}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="newLastName">Last Name</Label>
                <Input
                  id="newLastName"
                  value={newStaffData.lastName || ''}
                  onChange={(e) => setNewStaffData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="newEmail">Email</Label>
              <Input
                id="newEmail"
                type="email"
                value={newStaffData.email || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newStaffData.password || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newPhone">Phone</Label>
              <Input
                id="newPhone"
                value={newStaffData.phone || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newDepartment">Department</Label>
              <Input
                id="newDepartment"
                value={newStaffData.department || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newDesignation">Designation</Label>
              <Input
                id="newDesignation"
                value={newStaffData.designation || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, designation: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newCurrentLevel">Current Level</Label>
              <Input
                id="newCurrentLevel"
                value={newStaffData.currentLevel || ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, currentLevel: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newDateOfEmployment">Date of Employment</Label>
              <Input
                id="newDateOfEmployment"
                type="date"
                value={newStaffData.dateOfEmployment ? new Date(newStaffData.dateOfEmployment).toISOString().split('T')[0] : ''}
                onChange={(e) => setNewStaffData(prev => ({ ...prev, dateOfEmployment: new Date(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}