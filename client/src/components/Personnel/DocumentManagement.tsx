import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, FileText, Download, Upload, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import { insertDocumentSchema, type Document, type InsertDocument } from "@shared/schema";

interface DocumentManagementProps {
  personnelId: string;
}

export function DocumentManagement({ personnelId }: DocumentManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', personnelId],
  });

  const form = useForm<InsertDocument>({
    resolver: zodResolver(insertDocumentSchema),
    defaultValues: {
      personnelId,
      documentType: "",
      documentName: "",
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      filePath: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', personnelId] });
      handleCloseModal();
      toast({
        title: "Belge eklendi",
        description: "Belge bilgisi başarıyla kaydedildi.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertDocument> }) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', personnelId] });
      handleCloseModal();
      toast({
        title: "Belge güncellendi",
        description: "Belge bilgisi başarıyla güncellendi.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents', personnelId] });
      toast({
        title: "Belge silindi",
        description: "Belge başarıyla silindi.",
      });
    },
  });

  const handleCreate = () => {
    setEditingDocument(null);
    form.reset({
      personnelId,
      documentType: "",
      documentName: "",
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      issuingAuthority: "",
      filePath: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    form.reset({
      personnelId: document.personnelId,
      documentType: document.documentType,
      documentName: document.documentName,
      documentNumber: document.documentNumber,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate || "",
      issuingAuthority: document.issuingAuthority,
      filePath: document.filePath || "",
      notes: document.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDocument(null);
    form.reset();
  };

  const onSubmit = async (data: InsertDocument) => {
    try {
      if (editingDocument) {
        await updateMutation.mutateAsync({ id: editingDocument.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const getDocumentStatus = (document: Document) => {
    if (!document.expiryDate) return { status: 'active', label: 'Aktif', color: 'bg-green-100 text-green-800' };
    
    const expiryDate = new Date(document.expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysDiff < 0) {
      return { status: 'expired', label: 'Süresi Dolmuş', color: 'bg-red-100 text-red-800' };
    } else if (daysDiff <= 30) {
      return { status: 'expiring', label: 'Süresi Doluyor', color: 'bg-orange-100 text-orange-800' };
    } else {
      return { status: 'active', label: 'Aktif', color: 'bg-green-100 text-green-800' };
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'kimlik': return <FileText className="h-4 w-4" />;
      case 'diploma': return <FileText className="h-4 w-4" />;
      case 'sertifika': return <FileText className="h-4 w-4" />;
      case 'sözleşme': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Belge Yönetimi
          </CardTitle>
          <CardDescription>
            Personele ait belgeler ve süre takibi
          </CardDescription>
        </div>
        <Button onClick={handleCreate} size="sm" data-testid="button-add-document">
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz belge bulunmuyor.</p>
            <p className="text-sm">Yeni belge eklemek için "Ekle" butonunu kullanın.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Belge Adı</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Belge No</TableHead>
                <TableHead>Veren Kurum</TableHead>
                <TableHead>Son Kullanma</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => {
                const status = getDocumentStatus(document);
                return (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDocumentTypeIcon(document.documentType)}
                        {document.documentName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.documentType}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{document.documentNumber}</TableCell>
                    <TableCell>{document.issuingAuthority}</TableCell>
                    <TableCell>
                      {document.expiryDate ? (
                        <div className="flex items-center gap-1">
                          {status.status === 'expiring' && <AlertTriangle className="h-3 w-3 text-orange-500" />}
                          {status.status === 'expired' && <AlertTriangle className="h-3 w-3 text-red-500" />}
                          {status.status === 'active' && <CheckCircle className="h-3 w-3 text-green-500" />}
                          {new Date(document.expiryDate).toLocaleDateString('tr-TR')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {document.filePath && (
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-download-${document.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(document)}
                          data-testid={`button-edit-document-${document.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(document.id)}
                          data-testid={`button-delete-document-${document.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingDocument ? "Belgeyi Düzenle" : "Yeni Belge Ekle"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belge Türü *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tür seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kimlik">Kimlik Belgesi</SelectItem>
                          <SelectItem value="Diploma">Diploma</SelectItem>
                          <SelectItem value="Sertifika">Sertifika</SelectItem>
                          <SelectItem value="Sözleşme">Sözleşme</SelectItem>
                          <SelectItem value="Lisans">Lisans/Ruhsat</SelectItem>
                          <SelectItem value="Sigorta">Sigorta Belgesi</SelectItem>
                          <SelectItem value="Diğer">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belge Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nüfus Cüzdanı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="documentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belge/Seri No *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuingAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veren Kurum *</FormLabel>
                      <FormControl>
                        <Input placeholder="T.C. İçişleri Bakanlığı" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veriliş Tarihi *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Son Kullanma Tarihi</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="filePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosya Yolu</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input 
                          placeholder="Belge dosyasının yolu..." 
                          {...field} 
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Yükle
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ek bilgiler ve notlar..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) 
                    ? "Kaydediliyor..." 
                    : (editingDocument ? "Güncelle" : "Kaydet")
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                >
                  İptal
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}