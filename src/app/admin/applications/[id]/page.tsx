"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Calendar, FileText, Building, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchAdminApplications, updateAdminApplication } from "@/lib/api";
import type { Application } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminApplicationViewPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const applicationId = params.id as string;

  const [isClient, setIsClient] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadApplication() {
      try {
        setIsLoading(true);
        const applications = await fetchAdminApplications();
        const foundApplication = applications.find(app => app.id === applicationId);
        
        if (foundApplication) {
          setApplication(foundApplication);
        } else {
          toast({
            title: "Error",
            description: "Application not found",
            variant: "destructive",
          });
          router.push('/admin/applications');
        }
      } catch (error) {
        console.error("Failed to load application:", error);
        toast({
          title: "Error",
          description: "Failed to load application details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.role === 'admin' && applicationId) {
      loadApplication();
    }
  }, [user, applicationId, toast, router]);

  const handleStatusUpdate = async (newStatus: Application["status"]) => {
    if (!application) return;

    try {
      setIsUpdating(true);
      await updateAdminApplication(application.id!, { status: newStatus });
      
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    } catch (error) {
      console.error("Failed to update application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: Application["status"]) => {
    const colors = {
      submitted: "bg-blue-100 text-blue-800",
      reviewed: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || !isClient || isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (!application) {
    return <div className="container mx-auto p-6">Application not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/admin/applications">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">View and manage application information</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Applicant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Applicant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Name:</strong>
              <span className="ml-2">{application.applicantName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Email:</strong>
              <span className="ml-2">{application.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Applied Date:</strong>
              <span className="ml-2">{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Status:</strong>
              <span className="ml-2">{getStatusBadge(application.status)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recruitment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Position Applied For
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Position:</strong>
              <span className="ml-2">{application.recruitment?.title || 'N/A'}</span>
            </div>
            <div className="flex items-center">
              <Building className="mr-2 h-4 w-4 text-muted-foreground" />
              <strong>Department:</strong>
              <span className="ml-2">{application.recruitment?.department || 'N/A'}</span>
            </div>
            {application.recruitment?.description && (
              <div>
                <strong>Description:</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.recruitment.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resume and Cover Letter */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Application Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Resume:</strong>
              {application.resumeUrl ? (
                <div className="mt-2">
                  <Button variant="outline" asChild>
                    <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                </div>
              ) : (
                <span className="ml-2 text-muted-foreground">No resume uploaded</span>
              )}
            </div>
            
            {application.coverLetter && (
              <div>
                <strong>Cover Letter:</strong>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{application.coverLetter}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Update Application Status</CardTitle>
            <CardDescription>
              Change the status of this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Select 
                  value={application.status} 
                  onValueChange={(value: Application["status"]) => handleStatusUpdate(value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(application.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}