import { useState } from "react";
import { LoanApplicationForm } from "@/components/LoanApplicationForm";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserDashboard } from "@/components/UserDashboard";
import { HowItWorks } from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { Banknote, Shield, Search, Info } from "lucide-react";

type View = "apply" | "track" | "admin-login" | "admin-dashboard" | "how-it-works";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("apply");
  const [userMobile, setUserMobile] = useState("");

  const handleApplySuccess = (mobile: string) => {
    setUserMobile(mobile);
    setCurrentView("track");
  };

  const handleAdminLogin = () => {
    setCurrentView("admin-dashboard");
  };

  const handleAdminLogout = () => {
    setCurrentView("apply");
  };

  if (currentView === "admin-dashboard") {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Banknote className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">EdFund Loans</span>
          </div>
          
          <div className="flex gap-2">
            {currentView !== "track" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentView("track")}
              >
                <Search className="w-4 h-4 mr-2" />
                Track Loan
              </Button>
            )}
            {currentView !== "how-it-works" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentView("how-it-works")}
              >
                <Info className="w-4 h-4 mr-2" />
                How It Works
              </Button>
            )}
            {currentView === "apply" && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentView("admin-login")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {currentView === "apply" && (
          <div className="w-full space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Quick Loan Application</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Get fast and easy loans. Fill out the form below and we'll review your application.
              </p>
            </div>
            <LoanApplicationForm onSuccess={handleApplySuccess} />
            <p className="text-center text-sm text-muted-foreground mt-6">
              Contact: <a href="mailto:edufund0099@gmail.com" className="text-primary hover:underline">edufund0099@gmail.com</a>
            </p>
          </div>
        )}

        {currentView === "track" && (
          <UserDashboard 
            onBack={() => setCurrentView("apply")} 
            onApplyNew={() => setCurrentView("apply")}
            initialMobile={userMobile} 
          />
        )}

        {currentView === "admin-login" && (
          <AdminLogin onLogin={handleAdminLogin} onBack={() => setCurrentView("apply")} />
        )}

        {currentView === "how-it-works" && (
          <div className="w-full">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentView("apply")}
              className="mb-4"
            >
              ← Back
            </Button>
            <HowItWorks />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-4">
        <div className="text-center text-sm text-muted-foreground">
          © 2026 EdFund Loans. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
