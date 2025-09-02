import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BranchList } from "@/components/Branch/BranchList";
import { BranchModal } from "@/components/Branch/BranchModal";
import { BranchSettings } from "@/components/Branch/BranchSettings";
import { BranchAnalytics } from "@/components/Branch/BranchAnalytics";
import { Building, Plus, Settings, BarChart3 } from "lucide-react";

export default function Branch() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("branches");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);

  // Redirect to home if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <div>Yetkilendirme gerekli. Lütfen giriş yapın.</div>;
  }

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const handleCreateBranch = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  return (
    <div className="space-y-6" data-testid="branch-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Şube Yönetimi</h1>
          <p className="text-muted-foreground">
            Şubelerinizi yönetin, ayarları yapılandırın ve performansı analiz edin
          </p>
        </div>
        <Button onClick={handleCreateBranch} data-testid="button-create-branch">
          <Plus className="mr-2 h-4 w-4" />
          Yeni Şube
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Şubeler
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ayarlar
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analitik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şube Listesi</CardTitle>
              <CardDescription>
                Tüm şubelerinizi görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchList 
                onEdit={handleEditBranch}
                onDelete={(id: string) => {
                  // Handle delete logic here
                  toast({
                    title: "Şube silindi",
                    description: "Şube başarıyla sistemden kaldırıldı.",
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şube Ayarları</CardTitle>
              <CardDescription>
                Şube bazlı konfigürasyonlar ve kısıtlamalar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Şube Performans Analizi</CardTitle>
              <CardDescription>
                Şubeler arası performans karşılaştırması ve analitik
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BranchAnalytics />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <BranchModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          branch={editingBranch}
          onSuccess={() => {
            handleCloseModal();
            toast({
              title: editingBranch ? "Şube güncellendi" : "Şube oluşturuldu",
              description: editingBranch 
                ? "Şube bilgileri başarıyla güncellendi."
                : "Yeni şube başarıyla oluşturuldu.",
            });
          }}
        />
      )}
    </div>
  );
}