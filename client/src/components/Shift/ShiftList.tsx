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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Search,
  Clock,
  Edit,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Shift } from "@shared/schema";

export function ShiftList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading, error } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
    retry: false,
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/shifts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Başarılı",
        description: "Vardiya başarıyla silindi.",
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
        description: error.message || "Vardiya silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" vardiyasını silmek istediğinizden emin misiniz?`)) {
      deleteShiftMutation.mutate(id);
    }
  };

  const getStatusBadge = (isActive: boolean | null) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Pasif</Badge>
    );
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5); // HH:MM formatında göster
  };

  const filteredShifts = shifts.filter((shift) =>
    shift.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <p className="text-destructive">Vardiyalar yüklenirken bir hata oluştu.</p>
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
            placeholder="Vardiya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-shifts"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vardiya Adı</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Başlangıç Saati</TableHead>
              <TableHead>Bitiş Saati</TableHead>
              <TableHead>Çalışma Saatleri</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturma Tarihi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 8 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filteredShifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "Arama kriterlerinize uygun vardiya bulunamadı." : "Henüz vardiya tanımlanmamış."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredShifts.map((shift) => (
                <TableRow key={shift.id} data-testid={`shift-row-${shift.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{shift.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {shift.description || "-"}
                  </TableCell>
                  <TableCell>{formatTime(shift.startTime)}</TableCell>
                  <TableCell>{formatTime(shift.endTime)}</TableCell>
                  <TableCell>
                    {shift.workingHours ? `${shift.workingHours} saat` : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(shift.isActive)}</TableCell>
                  <TableCell>
                    {shift.createdAt ? new Date(shift.createdAt).toLocaleDateString('tr-TR') : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          data-testid={`shift-actions-${shift.id}`}
                        >
                          <span className="sr-only">İşlemler</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => console.log("Edit shift:", shift.id)}
                          data-testid={`edit-shift-${shift.id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(shift.id, shift.name || "")}
                          className="text-destructive"
                          data-testid={`delete-shift-${shift.id}`}
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
    </div>
  );
}