import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportBuilder } from "@/components/Reports/ReportBuilder";
import { ReportTemplates } from "@/components/Reports/ReportTemplates";
import { ReportHistory } from "@/components/Reports/ReportHistory";
import { ReportAnalytics } from "@/components/Reports/ReportAnalytics";
import { ScheduledReports } from "@/components/Reports/ScheduledReports";
import { 
  FileBarChart, 
  Settings, 
  History, 
  BarChart3,
  Clock,
  Plus
} from "lucide-react";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [reportBuilderOpen, setReportBuilderOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Raporlama Sistemi</h1>
            <p className="text-muted-foreground">
              Kapsamlı raporlar oluşturun, yönetin ve analiz edin
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setReportBuilderOpen(true)}
              data-testid="button-new-report"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Rapor
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="templates" data-testid="tab-templates">
            <FileBarChart className="mr-2 h-4 w-4" />
            Şablonlar
          </TabsTrigger>
          <TabsTrigger value="builder" data-testid="tab-builder">
            <Settings className="mr-2 h-4 w-4" />
            Rapor Oluşturucu
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <History className="mr-2 h-4 w-4" />
            Geçmiş
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Analitik
          </TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">
            <Clock className="mr-2 h-4 w-4" />
            Zamanlanmış
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <ReportTemplates />
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ReportHistory />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <ReportAnalytics />
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <ScheduledReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}