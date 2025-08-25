"use client";
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { recruitments } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, CheckCircle, University } from 'lucide-react';

export default function RecruitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const recruitment = recruitments.find((r) => r.id === id);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
        setSubmitted(true);
        setIsSubmitting(false);
    }, 1500);
  };

  if (!recruitment) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <h1 className="text-2xl font-bold">Recruitment not found</h1>
        <p className="text-muted-foreground">The job opening you are looking for does not exist.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
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
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Apply for this Position</CardTitle>
              <CardDescription>Fill out the form below to submit your application.</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Application Submitted!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    Thank you for your interest. We have received your application and will be in touch shortly.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV</Label>
                    <Input id="resume" type="file" required />
                    <p className="text-xs text-muted-foreground">Please upload your resume in PDF format.</p>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                    <Textarea id="cover-letter" placeholder="Tell us why you are a good fit for this role..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
