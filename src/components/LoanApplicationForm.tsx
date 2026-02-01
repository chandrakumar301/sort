import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

interface LoanApplicationFormProps {
  onSuccess: (mobile: string) => void;
}

export const LoanApplicationForm = ({ onSuccess }: LoanApplicationFormProps) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !mobile.trim() || !pan.trim() || !aadhaar.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // PAN validation: 5 letters, 4 numbers, 1 letter
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan)) {
      toast.error("Please enter a valid PAN number (e.g., ABCDE1234F)");
      return;
    }

    // Aadhaar validation: 12 digits
    if (!/^[0-9]{12}$/.test(aadhaar)) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase.from("loan_requests").insert({
      applicant_name: name.trim(),
      mobile_number: mobile.trim(),
      pan_number: pan.toUpperCase().trim(),
      aadhaar_number: aadhaar.trim(),
      amount: 0,
      purpose: null,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
      return;
    }

    setIsSuccess(true);
    toast.success("Loan application submitted successfully!");
    
    setTimeout(() => {
      const submittedMobile = mobile.trim();
      setName("");
      setMobile("");
      setPan("");
      setAadhaar("");
      setAmount("");
      setuccess(submittedMobile);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardContent className="pt-10 pb-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Application Submitted!</h3>
          <p className="text-muted-foreground">We will review your request and contact you soon.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-foreground">Create Profile</CardTitle>
        <CardDescription>Enter your basic details to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              type="password"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              disabled={isSubmitting}
              className="h-11 tracking-widest"
            />
            <p className="text-xs text-muted-foreground">Will not be shared publicly</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="pan">PAN Number *</Label>
              <Input
                id="pan"
                type="password"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase().slice(0, 10))}
                disabled={isSubmitting}
                className="h-11 tracking-widest"
              />
              <p className="text-xs text-muted-foreground">Confidential</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number *</Label>
              <Input
                id="aadhaar"
                type="password"
                placeholder="12-digit number"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                disabled={isSubmitting}
                className="h-11 tracking-widest"
              />
              <p className="text-xs text-muted-foreground">Secure entry</p>
            </div>
          </div>
          
          <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
