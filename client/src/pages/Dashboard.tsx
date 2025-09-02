import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { RecentActivities } from "@/components/Dashboard/RecentActivities";
import { QuickActions } from "@/components/Dashboard/QuickActions";
import { TodaysSchedule } from "@/components/Dashboard/TodaysSchedule";

interface DashboardProps {
  onAddPersonnel: () => void;
  onCreateShift: () => void;
  onGenerateReport: () => void;
  onSendNotification: () => void;
}

export default function Dashboard({ 
  onAddPersonnel, 
  onCreateShift, 
  onGenerateReport, 
  onSendNotification 
}: DashboardProps) {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Yetki Hatası",
        description: "Oturumunuz sona erdi. Yeniden giriş yapılıyor...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: stats, isLoading: statsLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Yetki Hatası",
        description: "Oturumunuz sona erdi. Yeniden giriş yapılıyor...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const defaultStats = {
    totalPersonnel: 0,
    onLeaveToday: 0,
    activeShifts: 0,
    pendingLeaves: 0,
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Personel yönetim sistemi genel görünümü</p>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        stats={stats || defaultStats} 
        isLoading={statsLoading} 
      />

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>

        {/* Quick Actions & Today's Schedule */}
        <div className="space-y-6">
          <QuickActions 
            onAddPersonnel={onAddPersonnel}
            onCreateShift={onCreateShift}
            onGenerateReport={onGenerateReport}
            onSendNotification={onSendNotification}
          />
          <TodaysSchedule />
        </div>
      </div>

      {error && !isUnauthorizedError(error) && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive font-medium">Dashboard verileri yüklenirken hata oluştu</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      )}
    </div>
  );
}
