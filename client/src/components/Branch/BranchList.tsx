import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, MapPin, Phone, Mail, Users } from "lucide-react";
import type { Branch } from "@shared/schema";

interface BranchListProps {
  onEdit: (branch: Branch) => void;
  onDelete: (id: string) => void;
}

export function BranchList({ onEdit, onDelete }: BranchListProps) {
  const { data: branches, isLoading } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-1/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-3 w-1/3" />
          </Card>
        ))}
      </div>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Henüz şube bulunmuyor. Yeni şube eklemek için "Yeni Şube" butonunu kullanın.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Şube Adı</TableHead>
              <TableHead>Adres</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Yönetici</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {branch.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {branch.address || "Adres belirtilmemiş"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {branch.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {branch.phone}
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {branch.email}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {branch.managerId ? "Atanmış" : "Atanmamış"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="default">Aktif</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(branch)}
                      data-testid={`button-edit-branch-${branch.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(branch.id)}
                      data-testid={`button-delete-branch-${branch.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Toplam {branches.length} şube</div>
        <div>Son güncelleme: {new Date().toLocaleDateString('tr-TR')}</div>
      </div>
    </div>
  );
}