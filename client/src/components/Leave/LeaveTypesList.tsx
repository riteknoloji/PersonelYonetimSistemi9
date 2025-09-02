import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import type { LeaveType } from "@shared/schema";

export function LeaveTypesList() {
  const { data: leaveTypes = [], isLoading, error } = useQuery<LeaveType[]>({
    queryKey: ["/api/leave-types"],
    retry: false,
  });

  const getStatusBadge = (isActive: boolean | null) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Aktif</Badge>
    ) : (
      <Badge variant="secondary">Pasif</Badge>
    );
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive">İzin türleri yüklenirken bir hata oluştu.</p>
        <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Mevcut İzin Türleri</h3>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>İzin Türü</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Maksimum Gün</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Oluşturma Tarihi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  {Array.from({ length: 5 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : leaveTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Henüz izin türü tanımlanmamış.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              leaveTypes.map((type) => (
                <TableRow key={type.id} data-testid={`leave-type-row-${type.id}`}>
                  <TableCell className="font-medium">{type.name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {type.description || "-"}
                  </TableCell>
                  <TableCell>
                    {type.maxDays ? `${type.maxDays} gün` : "Sınırsız"}
                  </TableCell>
                  <TableCell>{getStatusBadge(type.isActive)}</TableCell>
                  <TableCell>
                    {type.createdAt ? new Date(type.createdAt).toLocaleDateString('tr-TR') : "-"}
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