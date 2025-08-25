"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Promotion } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { fetchPromotionsByStaffId, createPromotionRequest } from "@/lib/api";

export default function StaffDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'staff')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    async function loadPromotions() {
      if (user?.id) {
        setPromotions(await fetchPromotionsByStaffId(user.id));
      }
    }
    loadPromotions();
  }, [user?.id]);
  
  const handlePromotionRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    const formData = new FormData(e.currentTarget);
    const newPosition = formData.get('newPosition') as string;

    try {
        const newPromotion = await createPromotionRequest({
            staffId: user.id,
            staffName: `${user.firstName} ${user.lastName}`,
            currentPosition: user.designation,
            newPosition
        });
        setPromotions(prev => [newPromotion, ...prev]);
        toast({
            title: "Request Submitted",
            description: "Your promotion request has been submitted for review.",
        });
        e.currentTarget.reset();
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to submit promotion request.",
            variant: "destructive"
        });
    }
  };

  if (loading || !user || user.role !== 'staff') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.firstName}.</p>
      </header>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Request a Promotion</CardTitle>
            <CardDescription>Fill out this form to submit a promotion request.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePromotionRequest}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input id="currentPosition" name="currentPosition" value={user.designation} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPosition">Requested New Position</Label>
                <Input id="newPosition" name="newPosition" placeholder="e.g., Associate Professor" required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit">Submit Request</Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Promotion History</CardTitle>
            <CardDescription>Track the status of your promotion requests here.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Current Position</TableHead>
                  <TableHead>New Position</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.length > 0 ? (
                  promotions.map((p: Promotion) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.currentPosition}</TableCell>
                      <TableCell>{p.newPosition}</TableCell>
                      <TableCell>{new Date(p.requestDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                           variant={
                            p.status === 'approved' ? 'default' : 
                            p.status === 'rejected' ? 'destructive' : 'secondary'
                           }
                           className={p.status === 'approved' ? 'bg-green-600' : ''}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">No promotion requests found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
