import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveRequestList } from "@/components/Leave/LeaveRequestList";
import { LeaveTypesList } from "@/components/Leave/LeaveTypesList";
import { LeaveRequestModal } from "@/components/Leave/LeaveRequestModal";
import { LeaveTypeModal } from "@/components/Leave/LeaveTypeModal";
import { CalendarPlus, Settings } from "lucide-react";

export default function Leave() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [typeModalOpen, setTypeModalOpen] = useState(false);

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
            <h1 className="text-2xl font-bold text-foreground">İzin Yönetimi</h1>
            <p className="text-muted-foreground">
              İzin talepleri ve izin türlerini yönetin
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setRequestModalOpen(true)}
              data-testid="button-new-leave-request"
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Yeni İzin Talebi
            </Button>
            <Button
              variant="outline"
              onClick={() => setTypeModalOpen(true)}
              data-testid="button-manage-leave-types"
            >
              <Settings className="mr-2 h-4 w-4" />
              İzin Türleri
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests" data-testid="tab-leave-requests">
            İzin Talepleri
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-leave-calendar">
            İzin Takvimi
          </TabsTrigger>
          <TabsTrigger value="statistics" data-testid="tab-leave-statistics">
            İstatistikler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <LeaveRequestList />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İzin Takvimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Takvim görünümü yakında eklenecek...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İzin İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  İstatistik grafikler yakında eklenecek...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <LeaveRequestModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
      />

      <LeaveTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
      />
    </div>
  );
}