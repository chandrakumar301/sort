import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Banknote, Clock, Loader2, RefreshCw, Phone, User, IndianRupee, CreditCard, FileText, MessageCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LoanRequest = Database["public"]["Tables"]["loan_requests"]["Row"];
type LoanStatus = Database["public"]["Enums"]["loan_status"];

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [, setTimerTick] = useState(0); // For forcing re-render of timer

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("loan_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch loan requests");
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("loan_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loan_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: LoanStatus) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("loan_requests")
      .update({ status })
      .eq("id", id);

    setUpdatingId(null);

    if (error) {
      toast.error("Failed to update status");
      console.error(error);
    } else {
      toast.success(`Loan request ${status}`);
    }
  };

  const getStatusBadge = (status: LoanStatus) => {
    const styles = {
      pending: "bg-warning/20 text-warning-foreground border-warning/30",
      approved: "bg-primary/20 text-primary border-primary/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
      disbursed: "bg-success/20 text-success border-success/30",
      completed: "bg-green-100 text-green-900 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
    };

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <Check className="w-3 h-3 mr-1" />,
      rejected: <X className="w-3 h-3 mr-1" />,
      disbursed: <Banknote className="w-3 h-3 mr-1" />,
      completed: <Check className="w-3 h-3 mr-1" />,
    };

    const labels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      disbursed: "Disbursed",
      completed: "Payment Received",
    };

    return (
      <Badge variant="outline" className={`${styles[status]} flex items-center capitalize`}>
        {icons[status]}
        {labels[status] || status}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mask sensitive data
  const maskMobileNumber = (mobile: string) => {
    if (!mobile || mobile.length < 4) return "****";
    return "****" + mobile.slice(-4);
  };

  const maskEmail = (email: string) => {
    if (!email) return "****@****";
    const [user, domain] = email.split("@");
    return user.charAt(0) + "***@" + domain;
  };

  // Set up timer for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1); // Force re-render
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Get hours and minutes remaining for real-time countdown
  const getTimeRemainingForPayment = (disbursedAt: string | null | undefined) => {
    if (!disbursedAt) return null;
    const disbursalDate = new Date(disbursedAt);
    const dueDate = new Date(disbursalDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const now = new Date();
    const timeRemaining = dueDate.getTime() - now.getTime();
    
    if (timeRemaining <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    disbursed: requests.filter((r) => r.status === "disbursed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
    completed: requests.filter((r) => r.status === "completed").length,
    totalAmount: requests.reduce((sum, r) => sum + Number(r.amount), 0),
    disbursedAmount: requests
      .filter((r) => r.status === "disbursed" || r.status === "completed")
      .reduce((sum, r) => sum + Number(r.amount), 0),
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage loan requests</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card className="bg-card">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-warning-foreground">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-primary">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card className="bg-success/10 border-success/20">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-success">{stats.disbursed}</div>
              <div className="text-sm text-muted-foreground">Disbursed</div>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/20">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
          <Card className="bg-green-100/50 border-green-300 dark:bg-green-950/50 dark:border-green-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Payments Received</div>
            </CardContent>
          </Card>
          <Card className="col-span-2 bg-accent/50">
            <CardContent className="pt-4 pb-4">
              <div className="text-xl font-bold text-foreground">{formatCurrency(stats.disbursedAmount)}</div>
              <div className="text-sm text-muted-foreground">Total Disbursed</div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Requests</CardTitle>
            <CardDescription>Review and manage all loan applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No loan requests yet
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 space-y-3 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold text-foreground">{request.applicant_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{maskMobileNumber(request.mobile_number)}</span>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="ml-auto h-8 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                          >
                            <a
                              href={`https://wa.me/91${request.mobile_number}?text=Hi%20${encodeURIComponent(request.applicant_name)},%20this%20is%20EdFund%20regarding%20your%20loan%20application.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-bold text-lg text-foreground">
                            <IndianRupee className="w-4 h-4" />
                            {formatCurrency(Number(request.amount)).replace("₹", "")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(request.created_at)}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Document Details */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {request.pan_number && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">PAN:</span>
                          <span className="font-mono font-medium text-foreground">{request.pan_number}</span>
                        </div>
                      )}
                      {request.aadhaar_number && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Aadhaar:</span>
                          <span className="font-mono font-medium text-foreground">
                            {request.aadhaar_number.slice(0, 4)} **** {request.aadhaar_number.slice(-4)}
                          </span>
                        </div>
                      )}
                    </div>

                    {request.purpose && (
                      <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                        <span className="font-medium">Purpose:</span> {request.purpose}
                      </div>
                    )}

                    {request.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, "approved")}
                          disabled={updatingId === request.id}
                          className="flex-1 sm:flex-none"
                        >
                          {updatingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(request.id, "rejected")}
                          disabled={updatingId === request.id}
                          className="flex-1 sm:flex-none"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {request.status === "approved" && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(request.id, "disbursed")}
                          disabled={updatingId === request.id}
                        >
                          {updatingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Banknote className="w-4 h-4 mr-1" />
                              Mark as Disbursed
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {request.status === "disbursed" && (
                      <div className="pt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800 dark:text-green-300"
                          onClick={() => updateStatus(request.id, "completed")}
                          disabled={updatingId === request.id}
                        >
                          {updatingId === request.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              User Paid (₹{Number(request.amount) + 10})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
