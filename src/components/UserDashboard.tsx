import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Loader2, Clock, Check, X, Banknote, IndianRupee, ArrowLeft, FileText, Mail, Phone, ExternalLink, Plus, CreditCard } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type LoanRequest = Database["public"]["Tables"]["loan_requests"]["Row"];
type LoanStatus = Database["public"]["Enums"]["loan_status"];

interface UserDashboardProps {
  onBack: () => void;
  onApplyNew: () => void;
  initialMobile?: string;
}

export const UserDashboard = ({ onBack, onApplyNew, initialMobile = "" }: UserDashboardProps) => {
  const [mobile, setMobile] = useState(initialMobile);
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [isSubmittingLoan, setIsSubmittingLoan] = useState(false);
  const [, setTimerTick] = useState(0); // For forcing re-render of timer

  useEffect(() => {
    if (initialMobile && /^[0-9]{10}$/.test(initialMobile)) {
      performSearch(initialMobile);
    }
  }, [initialMobile]);

  // Subscribe to realtime updates when status changes
  useEffect(() => {
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) return;

    const channel = supabase
      .channel("loan_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "loan_requests" },
        () => {
          performSearch(mobile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mobile]);

  const performSearch = async (mobileNumber: string) => {
    setIsLoading(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from("loan_requests")
      .select("*")
      .eq("mobile_number", mobileNumber.trim())
      .order("created_at", { ascending: false });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to fetch your requests");
      console.error(error);
      return;
    }

    setRequests(data || []);
  };

  const handleApplyForLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loanAmount || !mobile.trim()) {
      toast.error("Please enter loan amount");
      return;
    }

    const parsedAmount = parseFloat(loanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmittingLoan(true);

    const { error } = await supabase.from("loan_requests").insert({
      applicant_name: requests[0]?.applicant_name || "Unknown",
      mobile_number: mobile.trim(),
      pan_number: requests[0]?.pan_number || "",
      aadhaar_number: requests[0]?.aadhaar_number || "",
      amount: parsedAmount,
      purpose: loanPurpose.trim() || null,
    });

    setIsSubmittingLoan(false);

    if (error) {
      toast.error("Failed to submit loan request. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Loan request submitted successfully!");
    setLoanAmount("");
    setLoanPurpose("");
    setShowApplyForm(false);
    performSearch(mobile);
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
      completed: "Payment Confirmed",
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
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemainingForPayment = (disbursedAt: string | null | undefined) => {
    if (!disbursedAt) return null;
    const disbursalDate = new Date(disbursedAt);
    const dueDate = new Date(disbursalDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const now = new Date();
    const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 ? daysRemaining : 0;
  };

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

  // Set up timer for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1); // Force re-render
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

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

  const handlePaymentClick = (amount: number) => {
    const paymentAmount = amount + 10;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile: Try deep links
      const phonepeLink = `phonepe://pay?pa=yadavchandrakumar@axl&pn=EdFund&am=${paymentAmount}&tn=Loan%20Payment&tr=EDFUND${Date.now()}`;
      const upiLink = `upi://pay?pa=yadavchandrakumar@axl&pn=EdFund&am=${paymentAmount}&tn=Loan%20Payment&tr=EDFUND${Date.now()}`;
      
      window.location.href = phonepeLink;
      
      setTimeout(() => {
        window.location.href = upiLink;
        toast.success(`Opening payment for ₹${paymentAmount}`);
      }, 1500);
    } else {
      // On desktop: Copy UPI ID and provide PhonePe link
      navigator.clipboard.writeText("yadavchandrakumar@axl");
      toast.success(
        `Amount: ₹${paymentAmount}\n\nUPI ID copied!\n\nOption 1: Paste in PhonePe app (on phone)\nOption 2: Click "Open PhonePe Website" below`,
        { duration: 5000 }
      );
      
      // Open PhonePe website
      setTimeout(() => {
        window.open("https://www.phonepe.com", "_blank");
      }, 2000);
    }
  };

  const totalApplied = requests.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalDisbursed = requests
    .filter((r) => r.status === "disbursed")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button size="sm" onClick={onApplyNew} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Apply New Loan
        </Button>
      </div>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-white text-center shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Track Your Loans</h1>
        <p className="text-primary/90 text-lg">Monitor your application status in real-time</p>
      </div>

      {/* Search Form */}
      <Card className="shadow-md border-primary/10">
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); performSearch(mobile); }} className="space-y-3">
            <div>
              <Label htmlFor="search-mobile" className="text-base font-medium mb-2 block">Enter Your Mobile Number</Label>
              <div className="flex gap-3">
                <Input
                  id="search-mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  disabled={isLoading}
                  className="h-12 text-base"
                />
                <Button type="submit" disabled={isLoading} className="h-12 px-8">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && !isLoading && (
        <>
          {/* Apply for Loan Section */}
          {!showApplyForm ? (
            <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <CardContent className="pt-6 text-center">
                <h3 className="text-lg font-bold text-foreground mb-2">Ready to Apply for a Loan?</h3>
                <p className="text-muted-foreground mb-4">
                  Enter the loan amount and purpose below
                </p>
                <Button 
                  onClick={() => setShowApplyForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Loan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-purple-10 to-purple-5">
                <CardTitle className="text-xl">Apply for Loan Amount</CardTitle>
                <CardDescription>Enter the loan details you need</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleApplyForLoan} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loan-amount">Loan Amount (₹) *</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="loan-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(e.target.value)}
                        disabled={isSubmittingLoan}
                        className="h-11 pl-9"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan-purpose">Purpose (Optional)</Label>
                    <Textarea
                      id="loan-purpose"
                      placeholder="Why do you need this loan?"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      disabled={isSubmittingLoan}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={isSubmittingLoan}
                    >
                      {isSubmittingLoan ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Loan Request"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11"
                      onClick={() => {
                        setShowApplyForm(false);
                        setLoanAmount("");
                        setLoanPurpose("");
                      }}
                      disabled={isSubmittingLoan}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          {/* End Apply for Loan */}
          {requests.length > 0 ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground font-medium">Total Applied</div>
                      <Banknote className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(totalApplied)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{requests.length} request(s)</div>
                  </CardContent>
                </Card>
                <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground font-medium">Total Received</div>
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalDisbursed)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">Disbursed amount</div>
                  </CardContent>
                </Card>
              </div>

              {/* Request List */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                  <CardTitle className="text-xl">Your Loan Requests</CardTitle>
                  <CardDescription>Complete history of your applications</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="border-l-4 border-primary rounded-lg p-4 space-y-3 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <IndianRupee className="w-5 h-5 text-primary" />
                            <span className="text-xl font-bold text-foreground">
                              {formatCurrency(Number(request.amount)).replace("₹", "")}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            📅 Applied on {formatDate(request.created_at)}
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      {request.purpose && (
                        <div className="text-sm bg-card rounded p-2 border-l-2 border-primary/30">
                          <span className="font-medium text-foreground">Purpose:</span>
                          <span className="text-muted-foreground ml-2">{request.purpose}</span>
                        </div>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                        {request.pan_number && (
                          <div className="flex items-center gap-1 bg-muted rounded px-2 py-1">
                            <FileText className="w-3 h-3" />
                            PAN: {request.pan_number.slice(0, 2)}****{request.pan_number.slice(-2)}
                          </div>
                        )}
                      </div>

                      {/* Payment Due Section - Only show for disbursed loans */}
                      {request.status === "disbursed" && (
                        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                Payment Due
                              </p>
                              <p className="text-xs text-orange-700 dark:text-orange-300">
                                Amount to pay: ₹{Number(request.amount) + 10}
                                <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">
                                  (Original: ₹{request.amount} + ₹10 extra)
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              {(() => {
                                const time = getTimeRemainingForPayment(request.updated_at);
                                return (
                                  <>
                                    <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                                      {time?.days}d {time?.hours}h {time?.minutes}m
                                    </p>
                                    <p className="text-xs text-orange-700 dark:text-orange-300">remaining</p>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                          {/* <Button
                            onClick={() => handlePaymentClick(Number(request.amount))}
                            className="w-full h-9 bg-orange-600 hover:bg-orange-700 text-white text-sm"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pay ₹{Number(request.amount) + 10}
                          </Button> */}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-md border-0">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No Requests Found</h3>
                <p className="text-muted-foreground mb-4">
                  No loan requests found for this mobile number. Start by applying for a loan!
                </p>
                <Button onClick={onApplyNew} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Apply for Loan
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Payment Section */}
      {/* <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Make Payment
          </CardTitle>
          <CardDescription>Pay via PhonePe, Google Pay, or any UPI app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground">PhonePe Payment Details:</p>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Recipient:</span> EdFund Loans
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">UPI ID:</span> <span className="font-mono text-foreground">************@axl</span>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Phone:</span> <span className="font-mono text-foreground">**********8</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => {
                navigator.clipboard.writeText("********@axl");
                toast.success("UPI ID copied! Paste it in PhonePe app");
              }}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Copy & Pay in PhonePe
            </Button>

            <Button 
              asChild
              variant="outline"
              className="w-full h-10"
            >
              <a 
                href="https://www.phonepe.com/en/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PhonePe Website
              </a>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground bg-yellow-50 dark:bg-yellow-950 p-2 rounded">
            📱 Mobile: Click "Copy & Pay in PhonePe" and paste UPI ID in PhonePe app<br/>
            🖥️ Desktop: Use PhonePe website or ask your admin for payment link
          </p>
        </CardContent> */}
      {/* </Card> */}

      {/* Contact & Messaging Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Contact Card */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-orange-600" />
              Direct Contact
            </CardTitle>
            <CardDescription>Reach us directly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* <Button 
              asChild 
              className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white"
            >
              <a href="" className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call Now
              </a>
            </Button> */}
            <a href="tel:9573297146" className="text-center text-sm text-orange-700 dark:text-orange-300 hover:underline block">
              9573297146
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Email Contact Card */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Support
          </CardTitle>
          <CardDescription>Send us your queries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            asChild 
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <a href="mailto:edufund0099@gmail.com?subject=Loan%20Application%20Support" className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Send Email
            </a>
          </Button>
          <a href="mailto:edufund0099@gmail.com" className="text-center text-sm text-blue-700 dark:text-blue-300 hover:underline block">
            {maskEmail("edufund0099@gmail.com")}
          </a>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <a href="mailto:edufund0099@gmail.com" className="text-primary hover:underline font-medium">
                {maskEmail("edufund0099@gmail.com")}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
