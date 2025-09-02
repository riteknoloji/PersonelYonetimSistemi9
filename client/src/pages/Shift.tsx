import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShiftList } from "@/components/Shift/ShiftList";
import { ShiftAssignmentList } from "@/components/Shift/ShiftAssignmentList";
import { ShiftModal } from "@/components/Shift/ShiftModal";
import { ShiftAssignmentModal } from "@/components/Shift/ShiftAssignmentModal";
import { CalendarClock, UserPlus, Clock } from "lucide-react";

export default function Shift() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);

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
            <h1 className="text-2xl font-bold text-foreground">Vardiya Yönetimi</h1>
            <p className="text-muted-foreground">
              Vardiyaları tanımlayın ve personel atamalarını yönetin
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShiftModalOpen(true)}
              data-testid="button-new-shift"
            >
              <Clock className="mr-2 h-4 w-4" />
              Yeni Vardiya
            </Button>
            <Button
              variant="outline"
              onClick={() => setAssignmentModalOpen(true)}
              data-testid="button-assign-shift"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Vardiya Ataması
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="shifts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shifts" data-testid="tab-shifts">
            Vardiya Tanımları
          </TabsTrigger>
          <TabsTrigger value="assignments" data-testid="tab-assignments">
            Vardiya Atamaları
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-shift-calendar">
            Vardiya Takvimi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts" className="space-y-4">
          <ShiftList />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <ShiftAssignmentList />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" />
                Vardiya Takvimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Vardiya takvim görünümü yakında eklenecek...
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Günlük ve haftalık vardiya planlarını görsel olarak inceleyebileceksiniz.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ShiftModal
        open={shiftModalOpen}
        onOpenChange={setShiftModalOpen}
      />

      <ShiftAssignmentModal
        open={assignmentModalOpen}
        onOpenChange={setAssignmentModalOpen}
      />
    </div>
  );
}