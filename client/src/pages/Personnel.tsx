import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { PersonnelList } from "@/components/Personnel/PersonnelList";

export default function Personnel() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
        <h1 className="text-2xl font-bold text-foreground">Personel Yönetimi</h1>
        <p className="text-muted-foreground">
          Şirket personellerini ekleyin, düzenleyin ve yönetin
        </p>
      </div>

      {/* Personnel List */}
      <PersonnelList />
    </div>
  );
}
