import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "@/components/Layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Pages
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Personnel from "@/pages/Personnel";
import Leave from "@/pages/Leave";
import Shift from "@/pages/Shift";
import QrCodeManagement from "@/pages/QrCodeManagement";
import Calendar from "@/pages/Calendar";
import Notifications from "@/pages/Notifications";
import Reports from "@/pages/Reports";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeMenuItem, setActiveMenuItem] = useState("dashboard");

  const handleMenuItemChange = (item: string) => {
    setActiveMenuItem(item);
  };

  const handleAddPersonnel = () => {
    setActiveMenuItem("personnel");
  };

  const handleCreateShift = () => {
    toast({
      title: "Vardiya Oluştur",
      description: "Vardiya oluşturma özelliği yakında eklenecek.",
    });
  };

  const handleGenerateReport = () => {
    setActiveMenuItem("reports");
  };

  const handleSendNotification = () => {
    toast({
      title: "Bildirim Gönder",
      description: "Bildirim gönderme özelliği yakında eklenecek.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/">
          {() => (
            <MainLayout 
              activeMenuItem={activeMenuItem} 
              onMenuItemChange={handleMenuItemChange}
            >
              {activeMenuItem === "dashboard" && (
                <Dashboard
                  onAddPersonnel={handleAddPersonnel}
                  onCreateShift={handleCreateShift}
                  onGenerateReport={handleGenerateReport}
                  onSendNotification={handleSendNotification}
                />
              )}
              {activeMenuItem === "personnel" && <Personnel />}
              {activeMenuItem === "leave" && <Leave />}
              {activeMenuItem === "shift" && <Shift />}
              {activeMenuItem === "attendance" && <QrCodeManagement />}
              {activeMenuItem === "calendar" && <Calendar />}
              {activeMenuItem === "notifications" && <Notifications />}
              {activeMenuItem === "branch" && (
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold">Şube Yönetimi</h1>
                  <p className="text-muted-foreground mt-2">Bu özellik yakında eklenecek.</p>
                </div>
              )}
              {activeMenuItem === "calendar" && (
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold">Takvim</h1>
                  <p className="text-muted-foreground mt-2">Bu özellik yakında eklenecek.</p>
                </div>
              )}
              {activeMenuItem === "reports" && <Reports />}
              {activeMenuItem === "settings" && (
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold">Ayarlar</h1>
                  <p className="text-muted-foreground mt-2">Bu özellik yakında eklenecek.</p>
                </div>
              )}
            </MainLayout>
          )}
        </Route>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
