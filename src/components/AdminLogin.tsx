import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield } from "lucide-react";

const ADMIN_EMAIL = "edufund0099@gmail.com";
const ADMIN_PASSWORD = "chandu0099";

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLogin = ({ onLogin, onBack }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsSubmitting(true);
    
    // Verify credentials
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (
      email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD
    ) {
      toast.success("Welcome, Admin!");
      onLogin();
      // Reset form
      setEmail("");
      setPassword("");
    } else if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
      toast.error("Invalid password");
    } else {
      toast.error("Unauthorized. Only admin can access this page.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Admin Access</CardTitle>
        <CardDescription>Enter your credentials to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Admin Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="h-11"
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Access Dashboard"
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back to Apply
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
