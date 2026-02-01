import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, IndianRupee, FileCheck } from "lucide-react";

export const HowItWorks = () => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">How Our 3-Day Money Lending System Works</h2>
        <p className="text-muted-foreground">Simple, transparent, and fast loan processing</p>
      </div>

      {/* Timeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <Card className="relative">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Step 1: Apply</CardTitle>
                <CardDescription>Submit your application</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              Fill out the loan application form with your basic details, PAN, and Aadhaar number.
            </p>
            <p className="text-sm text-muted-foreground">
              Takes less than 2 minutes to complete.
            </p>
          </CardContent>
        </Card>

        {/* Step 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Step 2: Review & Approval</CardTitle>
                <CardDescription>Admin reviews your application</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              Our admin team reviews your application within a few hours.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be notified once your loan is approved.
            </p>
          </CardContent>
        </Card>

        {/* Step 3 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <IndianRupee className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Step 3: Money Disbursed</CardTitle>
                <CardDescription>Loan amount is transferred</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              Once approved, the loan amount is immediately disbursed to your account.
            </p>
            <p className="text-sm text-muted-foreground">
              You have 3 days to repay the entire amount with interest.
            </p>
          </CardContent>
        </Card>

        {/* Step 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Step 4: Repayment</CardTitle>
                <CardDescription>Pay back within 3 days</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">
              Pay using UPI (PhonePe, Google Pay, or any UPI app) via our secure payment link.
            </p>
            <p className="text-sm text-muted-foreground">
              3-day countdown timer helps you track your payment deadline.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Key Features of Our System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">⚡ Fast Processing</p>
                <p className="text-xs text-muted-foreground">Approval within hours</p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">🔒 Secure</p>
                <p className="text-xs text-muted-foreground">Your data is encrypted</p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">⏱️ 3-Day Tenure</p>
                <p className="text-xs text-muted-foreground">Short-term lending option</p>
              </div>
            </div>
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">💳 Multiple Payment Options</p>
                <p className="text-xs text-muted-foreground">UPI, PhonePe, Google Pay</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Formula */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Total Amount Due =</span> <span className="text-primary">Loan Amount + ₹10 Extra</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Example: If you borrow ₹1,000, you need to repay ₹1,010 within 3 days.
            </p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-semibold">⚠️ Important:</span> Payment must be made within 3 days of disbursement. Late payments may result in additional charges.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">Q: What is the maximum loan amount?</p>
            <p className="text-sm text-muted-foreground">A: Contact admin at edufund0099@gmail.com for loan limit details.</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Q: What if I can't repay within 3 days?</p>
            <p className="text-sm text-muted-foreground">A: Contact the admin immediately to discuss payment arrangements.</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Q: Is my data safe?</p>
            <p className="text-sm text-muted-foreground">A: Yes, all your data is encrypted and stored securely. We never share your information.</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Q: How do I track my application?</p>
            <p className="text-sm text-muted-foreground">A: Use the "Track Loan" feature with your mobile number to check real-time status.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
