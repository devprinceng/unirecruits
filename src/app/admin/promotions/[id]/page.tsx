"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar, Briefcase, ArrowRight, TrendingUp, BadgeCheck, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { fetchPromotionById, updatePromotionStatus } from '@/lib/api';
import type { Promotion, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminPromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [staffMember, setStaffMember] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPromotion() {
      try {
        const promoData = await fetchPromotionById(id);
        setPromotion(promoData.promotion);
        setStaffMember(promoData.staffMember);
      } catch (error) {
        toast({ title: "Error", description: "Could not load promotion details.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadPromotion();
    }
  }, [id, toast]);

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    if (!promotion) return;
    try {
        const updatedPromotion = await updatePromotionStatus(promotion.id, status);
        setPromotion(updatedPromotion);
        toast({
            title: `Request ${status}`,
            description: `The promotion request has been ${status}.`
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to update promotion status.",
            variant: "destructive"
        });
    }
  };

  const getInitials = (firstName: string = '', lastName: string = '') => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 md:px-6 text-center">Loading promotion details...</div>;
  }

  if (!promotion || !staffMember) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 text-center">
        <h1 className="text-2xl font-bold">Promotion Request not found</h1>
        <p className="text-muted-foreground">The request you are looking for does not exist.</p>
        <Button onClick={() => router.push('/admin/dashboard')} className="mt-4">Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <Button onClick={() => router.back()} variant="outline" className="mb-4">
        &larr; Back to Dashboard
      </Button>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Promotion Request Details</CardTitle>
          <div className="flex items-center justify-between pt-2">
            <CardDescription className="flex items-center text-base">
                <Calendar className="mr-2 h-5 w-5" /> Request Date: {new Date(promotion.requestDate).toLocaleDateString()}
            </CardDescription>
            <Badge 
                variant={
                promotion.status === 'approved' ? 'default' : 
                promotion.status === 'rejected' ? 'destructive' : 'secondary'
                }
                className={promotion.status === 'approved' ? 'bg-green-600' : ''}
            >
                {promotion.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://avatar.vercel.sh/${staffMember.email}.png`} alt={`${staffMember.firstName} ${staffMember.lastName}`} />
                            <AvatarFallback>{getInitials(staffMember.firstName, staffMember.lastName)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <h3 className="text-xl font-semibold">{staffMember.firstName} {staffMember.lastName}</h3>
                             <p className="text-muted-foreground">{staffMember.email}</p>
                        </div>
                    </div>
                    <Separator/>
                    <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Employment Details</h4>
                         <p className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground"/> <strong>Department:</strong><span className="ml-2">{staffMember.department}</span></p>
                        <p className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground"/> <strong>Date of Employment:</strong><span className="ml-2">{new Date(staffMember.dateOfEmployment).toLocaleDateString()}</span></p>
                        <p className="flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-muted-foreground"/> <strong>Current Level:</strong><span className="ml-2">{staffMember.currentLevel}</span></p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Promotion Details</h4>
                     <div className="flex items-center gap-4 text-center">
                        <div className="flex-1 p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">From</p>
                            <p className="font-semibold">{promotion.currentPosition}</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-muted-foreground"/>
                         <div className="flex-1 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <p className="text-sm text-primary">To</p>
                            <p className="font-semibold text-primary">{promotion.newPosition}</p>
                        </div>
                    </div>
                     <div className="pt-4">
                        <h4 className="font-semibold text-lg">Reason/Justification</h4>
                        <p className="text-muted-foreground text-sm italic">
                            (In a real application, this section would contain documents or text provided by the staff member to justify their promotion request, such as performance reviews, publications, or a personal statement.)
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
         {promotion.status === 'pending' && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')}><ShieldX className="mr-2"/> Reject</Button>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate('approved')}><BadgeCheck className="mr-2"/> Approve</Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
