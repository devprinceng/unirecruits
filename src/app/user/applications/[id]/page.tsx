"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, User, Mail, Phone, Building, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchUserApplicationById, fetchRecruitmentById } from "@/lib/api";
import type { Application, Recruitment } from "@/lib/types";

export default function UserApplicationDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [recruitment, setRecruitment] = useState<Recruitment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applicationId = params.id as string;

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'user')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadApplicationData() {
      if (!user || user.role !== 'user' || !applicationId) return;
      
      try {
        setIsLoading(true);
        const applicationData = await fetchUserApplicationById(applicationId);
        setApplication(applicationData);

        if (applicationData.recruitmentId) {
          const recruitmentData = await fetchRecruitmentById(applicationData.recruitmentId);
          setRecruitment(recruitmentData);
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

    if (user?.role === 'user' && applicationId) {
      loadApplicationData();
    }
  }, [user, applicationId, toast]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !isClient) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The application you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/user/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/user/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Application Details</h1>
          <p className="text-muted-foreground">View your application information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Status Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Status</label>
              <div className="mt-1">
                {getStatusBadge(application.status)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Applied On</label>
              <p className="text-sm mt-1">{formatDate(application.createdAt)}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm mt-1">{formatDate(application.updatedAt)}</p>
            </div>

            {application.resumeUrl && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Resume</label>
                <div className="mt-1">
                  <a 
                    href={application.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    View Resume
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Position Details Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Position Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recruitment ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                  <h3 className="text-xl font-semibold mt-1">{recruitment.title}</h3>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="mt-1">{recruitment.department}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {recruitment.department}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                  <p className="mt-1">Full-time</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Salary Range</label>
                  <p className="mt-1">Competitive</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Application Deadline</label>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(recruitment.closingDate)}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Job Description</label>
                  <div className="mt-1 prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{recruitment.description}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requirements</label>
                  <div className="mt-1 prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{recruitment.requirements}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Position details not available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Application Timeline */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Timeline
          </CardTitle>
          <CardDescription>
            Track the progress of your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Application Submitted</p>
                <p className="text-sm text-muted-foreground">{formatDate(application.createdAt)}</p>
              </div>
            </div>
            
            {application.status !== 'submitted' && (
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Status Updated to {application.status}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="mt-1">{user.firstName} {user.lastName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
            
            {user.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="mt-1 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}