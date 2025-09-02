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
  Check, 
  X, 
  Search,
  Calendar,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { LeaveRequestWithRelations } from "@shared/schema";

export function LeaveRequestList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leaveRequests = [], isLoading, error } = useQuery<LeaveRequestWithRelations[]>({
    queryKey: ["/api/leave-requests"],
    retry: false,
  });

  const updateLeaveRequestMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { 
      id: string; 
      status: string; 
      rejectionReason?: string; 
    }) => {
      return await apiRequest("PUT", `/api/leave-requests/${id}`, {
        status,
        rejectionReason: rejectionReason || null,
        approvedAt: status === "approved" ? new Date().toISOString() : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Başarılı",
        description: "İzin talebi durumu güncellendi.",
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
        description: error.message || "İzin talebi güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (id: string) => {
    if (window.confirm("Bu izin talebini onaylamak istediğinizden emin misiniz?")) {
      updateLeaveRequestMutation.mutate({ id, status: "approved" });
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt("Red nedeni giriniz (isteğe bağlı):");
    if (reason !== null) { // User didn't cancel
      updateLeaveRequestMutation.mutate({ 
        id, 
        status: "rejected", 
        rejectionReason: reason || "Belirtilmemiş" 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRequests = leaveRequests.filter((request) =>
    request.personnel?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.personnel?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.leaveType?.name?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <p className="text-destructive">İzin talepleri yüklenirken bir hata oluştu.</p>
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
            placeholder="İzin talebi ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-leave-requests"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Personel</TableHead>
              <TableHead>İzin Türü</TableHead>
              <TableHead>Başlangıç Tarihi</TableHead>
              <TableHead>Bitiş Tarihi</TableHead>
              <TableHead>Gün Sayısı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Talep Tarihi</TableHead>
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
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "Arama kriterlerinize uygun izin talebi bulunamadı." : "Henüz izin talebi oluşturulmamış."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id} data-testid={`leave-request-row-${request.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.personnel?.firstName} {request.personnel?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{request.leaveType?.name || "-"}</TableCell>
                  <TableCell>{request.startDate}</TableCell>
                  <TableCell>{request.endDate}</TableCell>
                  <TableCell>{request.days} gün</TableCell>
                  <TableCell>{getStatusBadge(request.status || "pending")}</TableCell>
                  <TableCell>
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString('tr-TR') : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            data-testid={`leave-actions-${request.id}`}
                          >
                            <span className="sr-only">İşlemler</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600"
                            data-testid={`approve-leave-${request.id}`}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Onayla
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReject(request.id)}
                            className="text-destructive"
                            data-testid={`reject-leave-${request.id}`}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reddet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {request.status !== "pending" && (
                      <span className="text-sm text-muted-foreground">
                        {request.status === "approved" ? "Onaylandı" : "Reddedildi"}
                      </span>
                    )}
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