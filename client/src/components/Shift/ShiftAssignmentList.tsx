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
  Users,
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ShiftAssignmentWithRelations } from "@shared/schema";

export function ShiftAssignmentList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading, error } = useQuery<ShiftAssignmentWithRelations[]>({
    queryKey: ["/api/shift-assignments", selectedDate],
    retry: false,
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/shift-assignments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
      toast({
        title: "Başarılı",
        description: "Vardiya ataması başarıyla silindi.",
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
        description: error.message || "Vardiya ataması silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Bu vardiya atamasını silmek istediğinizden emin misiniz?")) {
      deleteAssignmentMutation.mutate(id);
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

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.personnel?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.personnel?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.shift?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <p className="text-destructive">Vardiya atamaları yüklenirken bir hata oluştu.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Personel veya vardiya ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-assignments"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Tarih:</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
            data-testid="date-picker"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personel</TableHead>
              <TableHead>Vardiya</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Başlangıç Saati</TableHead>
              <TableHead>Bitiş Saati</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Atanma Tarihi</TableHead>
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
            ) : filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "Arama kriterlerinize uygun vardiya ataması bulunamadı." : 
                       selectedDate ? `${selectedDate} tarihinde vardiya ataması bulunamadı.` :
                       "Henüz vardiya ataması yapılmamış."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id} data-testid={`assignment-row-${assignment.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {assignment.personnel?.firstName} {assignment.personnel?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.shift?.name || "-"}
                  </TableCell>
                  <TableCell>
                    {assignment.date ? new Date(assignment.date).toLocaleDateString('tr-TR') : "-"}
                  </TableCell>
                  <TableCell>{formatTime(assignment.shift?.startTime || null)}</TableCell>
                  <TableCell>{formatTime(assignment.shift?.endTime || null)}</TableCell>
                  <TableCell>{getStatusBadge(assignment.isActive)}</TableCell>
                  <TableCell>
                    {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString('tr-TR') : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          data-testid={`assignment-actions-${assignment.id}`}
                        >
                          <span className="sr-only">İşlemler</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(assignment.id)}
                          className="text-destructive"
                          data-testid={`delete-assignment-${assignment.id}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Atamayı Sil
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