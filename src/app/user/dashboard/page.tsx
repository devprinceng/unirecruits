"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Calendar, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchUserApplications, fetchRecruitments } from "@/lib/api";
import type { Application, Recruitment } from "@/lib/types";

export default function UserDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [recruitments, setRecruitments] = useState<Recruitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log("user", user)
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    
    if (!loading && user && user.role !== 'user') {
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadUserData() {
      if (!user || user.role !== 'user') return;
      
      try {
        setIsLoading(true);
        const [userApplications, allRecruitments] = await Promise.all([
          fetchUserApplications(),
          fetchRecruitments()
        ]);
        
        setApplications(userApplications);
        setRecruitments(allRecruitments);
      } catch (error) {
        console.error("Failed to load user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your applications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'user') {
      loadUserData();
    }
  }, [user, toast]);

  const getStatusBadge = (status: string) => {
    const colors = {
      "Pending": "bg-yellow-100 text-yellow-800",
      "Under Review": "bg-blue-100 text-blue-800",
      "Approved": "bg-green-100 text-green-800",
      "Rejected": "bg-red-100 text-red-800",
      "Shortlisted": "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const getRecruitmentTitle = (recruitmentId: string) => {
    const recruitment = recruitments.find(r => r.id === recruitmentId);
    return recruitment?.title || "Unknown Position";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || !isClient) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.firstName}!</p>
      </div>

      {/* User Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.firstName} {user.lastName}</div>
            <p className="text-xs text-muted-foreground">
              <Mail className="h-3 w-3 inline mr-1" />
              {user.email}
            </p>
            {user.phone && (
              <p className="text-xs text-muted-foreground">
                <Phone className="h-3 w-3 inline mr-1" />
                {user.phone}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              Applications submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
          <CardDescription>
            Track the status of all your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading your applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {getRecruitmentTitle(application.recruitmentId)}
                    </TableCell>
                    <TableCell>{formatDate(application.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(application.status)}</TableCell>
                    <TableCell>{formatDate(application.updatedAt)}</TableCell>
                    <TableCell>
                      <Link href={`/user/applications/${application.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any applications yet. Browse available positions to get started.
              </p>
              <Link href="/#latest-jobs">
                <Button>
                  Browse Jobs
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/recruitments">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Browse Jobs
          </Button>
        </Link>
        <Link href="/user/profile">
          <Button variant="outline">
            <User className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}