import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonnelModal } from "./PersonnelModal";
import { MoreHorizontal, Edit, Trash2, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { PersonnelWithRelations } from "@shared/schema";

export function PersonnelList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelWithRelations | undefined>(undefined);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personnel = [], isLoading, error } = useQuery({
    queryKey: ["/api/personnel"],
    retry: false,
  });

  const deletePersonnelMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/personnel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla silindi.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Yetki Hatası",
          description: "Oturumunuz sona erdi. Yeniden giriş yapın...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: error.message || "Personel silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleAddPersonnel = () => {
    setSelectedPersonnel(undefined);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleEditPersonnel = (personnel: PersonnelWithRelations) => {
    setSelectedPersonnel(personnel);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDeletePersonnel = (id: string) => {
    if (window.confirm("Bu personeli silmek istediğinizden emin misiniz?")) {
      deletePersonnelMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>;
      case "inactive":
        return <Badge variant="secondary">Pasif</Badge>;
      case "terminated":
        return <Badge variant="destructive">İşten Ayrılmış</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPersonnel = personnel.filter((person: PersonnelWithRelations) =>
    person.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    if (isUnauthorizedError(error)) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Oturumunuz sona erdi. Yeniden giriş yapılıyor...</p>
        </div>
      );
    }
    
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Personel listesi yüklenirken bir hata oluştu.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Personel ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-personnel"
          />
        </div>
        <Button onClick={handleAddPersonnel} data-testid="button-add-personnel">
          Yeni Personel Ekle
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personel ID</TableHead>
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta</TableHead>
              <TableHead>Departman</TableHead>
              <TableHead>Pozisyon</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 7 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredPersonnel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchQuery ? "Arama kriterlerinize uygun personel bulunamadı." : "Henüz personel eklenmemiş."}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPersonnel.map((person: PersonnelWithRelations) => (
                <TableRow key={person.id} data-testid={`personnel-row-${person.id}`}>
                  <TableCell className="font-medium">{person.employeeId}</TableCell>
                  <TableCell>{`${person.firstName} ${person.lastName}`}</TableCell>
                  <TableCell>{person.email || "-"}</TableCell>
                  <TableCell>{person.department?.name || "-"}</TableCell>
                  <TableCell>{person.position || "-"}</TableCell>
                  <TableCell>{getStatusBadge(person.status || "active")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          data-testid={`personnel-actions-${person.id}`}
                        >
                          <span className="sr-only">İşlemler</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditPersonnel(person)}
                          data-testid={`edit-personnel-${person.id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePersonnel(person.id)}
                          className="text-destructive"
                          data-testid={`delete-personnel-${person.id}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PersonnelModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        personnel={selectedPersonnel}
        mode={modalMode}
      />
    </div>
  );
}
