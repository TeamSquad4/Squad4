import { createFileRoute, redirect } from "@tanstack/react-router";
import { getRole } from "@/lib/auth-state";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

export const Route = createFileRoute("/access")({
  beforeLoad: () => {
    const role = getRole();
    if (!role) throw redirect({ to: "/login" });
    if (role === "admin") throw redirect({ to: "/admin" });
    if (role === "doctor") throw redirect({ to: "/doctor" });
  },
  head: () => ({
    meta: [
      { title: "Access Control — MedVault" },
      { name: "description", content: "Manage which doctors and providers can access your records." },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState<any>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await api.access.getMyRequests();
        setRequests(data);
      } catch (error) {
        toast.error(`Failed to load access requests: ${(error as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;

    try {
      if (actionType === "approve") {
        await api.access.approve(actionTarget.id);
        toast.success("Access approved", { description: `Doctor can now view your records.` });
      } else {
        await api.access.reject(actionTarget.id);
        toast.success("Access rejected", { description: `Request denied.` });
      }
      
      // Refresh the list
      const data = await api.access.getMyRequests();
      setRequests(data);
    } catch (error) {
      toast.error(`Failed to ${actionType} request: ${(error as Error).message}`);
    } finally {
      setActionTarget(null);
      setActionType(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage doctor access requests to your medical records.
            </p>
          </div>
        </div>

        {/* Pending Requests */}
        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
            <CardDescription>
              Doctors requesting access to view your records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending access requests
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>Dr</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Doctor #{request.doctor_id}</p>
                        <p className="text-sm text-muted-foreground">Requested access to your records</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActionTarget(request);
                          setActionType("reject");
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActionTarget(request);
                          setActionType("approve");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Access */}
        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Approved Access ({approvedRequests.length})
            </CardTitle>
            <CardDescription>
              Doctors who can currently view your records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {approvedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No approved access yet
              </div>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>Dr</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Doctor #{request.doctor_id}</p>
                        <Badge variant="secondary">Approved</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve Access Request" : "Reject Access Request"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "This doctor will be able to view your medical records."
                  : "This doctor will not be able to access your records."
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleAction}>
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
