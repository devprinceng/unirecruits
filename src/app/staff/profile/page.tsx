"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StaffProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    setIsClient(true);
    if (!loading) {
      if (!user || user.role !== 'staff') {
        router.push('/auth/login');
      } else {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
        });
      }
    }
  }, [user, loading, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
        ...formData,
        [e.target.id]: e.target.value
    });
  };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    // In a real app, you would send this to an API.
    const updatedUser = { ...user, ...formData } as User;
    
    setTimeout(() => {
        updateUser(updatedUser);
        console.log("Updated user profile:", updatedUser);

        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully updated.",
        });
        setIsSaving(false);
    }, 1000);
  };
  
  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName[0] || ''}${lastName[0] || ''}`;
  }

  if (loading || !user || user.role !== 'staff') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">View and update your personal information.</p>
      </header>
      
      <Card className="max-w-4xl mx-auto">
        <form onSubmit={handleProfileUpdate}>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-3xl">{getInitials(user.firstName, user.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
                <CardDescription>
                    {user.designation} &bull; {user.department}
                </CardDescription>
                <div className="mt-2 text-sm text-muted-foreground">
                    <p>Current Level: {user.currentLevel}</p>
                    <p>Date of Employment: {new Date(user.dateOfEmployment).toLocaleDateString()}</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName || ''} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName || ''} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={formData.email || ''} onChange={handleChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={formData.phone || ''} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="Enter new password (optional)" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
