"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { fetchAdminPromotions, updateAdminPromotion, deleteAdminPromotion } from "@/lib/api";
import type { Promotion } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPromotionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Promotion["status"]>("pending");

  useEffect(() => {
    setIsClient(true);
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function loadPromotions() {
      try {
        const data = await fetchAdminPromotions();
        setPromotions(data);
      } catch (error) {
        console.error("Failed to load promotions:", error);
        toast({
          title: "Error",
          description: "Failed to load promotions",
          variant: "destructive",
        });
      }
    }

    if (user?.role === 'admin') {
      loadPromotions();
    }
  }, [user, toast]);

  const handleStatusUpdate = async () => {
    if (!selectedPromotion) return;

    try {
      await updateAdminPromotion(selectedPromotion.id, { status: newStatus });
      
      setPromotions(prev => 
        prev.map(promo => 
          promo.id === selectedPromotion.id 
            ? { ...promo, status: newStatus }
            : promo
        )
      );

      toast({
        title: "Success",
        description: "Promotion status updated successfully",
      });

      setIsStatusDialogOpen(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error("Failed to update promotion status:", error);
      toast({
        title: "Error",
        description: "Failed to update promotion status",
        variant: "destructive",
      });
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm("Are you sure you want to delete this promotion request?")) return;

    try {
      await deleteAdminPromotion(promotionId);
      
      setPromotions(prev => prev.filter(promo => promo.id !== promotionId));

      toast({
        title: "Success",
        description: "Promotion request deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete promotion:", error);
      toast({
        title: "Error",
        description: "Failed to delete promotion request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: Promotion["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleQuickApprove = async (promotion: Promotion) => {
    try {
      await updateAdminPromotion(promotion.id, { status: "approved" });
      
      setPromotions(prev => 
        prev.map(promo => 
          promo.id === promotion.id 
            ? { ...promo, status: "approved" }
            : promo
        )
      );

      toast({
        title: "Success",
        description: "Promotion approved successfully",
      });
    } catch (error) {
      console.error("Failed to approve promotion:", error);
      toast({
        title: "Error",
        description: "Failed to approve promotion",
        variant: "destructive",
      });
    }
  };

  const handleQuickReject = async (promotion: Promotion) => {
    try {
      await updateAdminPromotion(promotion.id, { status: "rejected" });
      
      setPromotions(prev => 
        prev.map(promo => 
          promo.id === promotion.id 
            ? { ...promo, status: "rejected" }
            : promo
        )
      );

      toast({
        title: "Success",
        description: "Promotion rejected successfully",
      });
    } catch (error) {
      console.error("Failed to reject promotion:", error);
      toast({
        title: "Error",
        description: "Failed to reject promotion",
        variant: "destructive",
      });
    }
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
          <h1 className="text-3xl font-bold">Promotions Management</h1>
          <p className="text-muted-foreground">Manage all staff promotion requests</p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotion Requests</CardTitle>
          <CardDescription>
            Review and manage staff promotion requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Current Position</TableHead>
                <TableHead>New Position</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">
                    {promotion.staffName}
                  </TableCell>
                  <TableCell>{promotion.currentPosition}</TableCell>
                  <TableCell>{promotion.newPosition}</TableCell>
                  <TableCell>
                    {new Date(promotion.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(promotion.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {promotion.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickApprove(promotion)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReject(promotion)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Link href={`/admin/promotions/${promotion.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePromotion(promotion.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {promotions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No promotion requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Promotion Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedPromotion?.staffName}'s promotion request
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={(value: Promotion["status"]) => setNewStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}