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
import { Plus, Edit, Trash2, Heart, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { insertHealthRecordSchema, type HealthRecord, type InsertHealthRecord } from "@shared/schema";

interface HealthManagementProps {
  personnelId: string;
}

export function HealthManagement({ personnelId }: HealthManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const { data: healthRecords, isLoading } = useQuery<HealthRecord[]>({
    queryKey: ['/api/health-records', personnelId],
  });

  const form = useForm<InsertHealthRecord>({
    resolver: zodResolver(insertHealthRecordSchema),
    defaultValues: {
      personnelId,
      recordType: "health_check",
      reportDate: "",
      doctorName: "",
      hospitalName: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      nextCheckupDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertHealthRecord) => {
      const response = await fetch('/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create health record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-records', personnelId] });
      handleCloseModal();
      toast({
        title: "Sağlık kaydı eklendi",
        description: "Sağlık bilgisi başarıyla kaydedildi.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertHealthRecord> }) => {
      const response = await fetch(`/api/health-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update health record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-records', personnelId] });
      handleCloseModal();
      toast({
        title: "Sağlık kaydı güncellendi",
        description: "Sağlık bilgisi başarıyla güncellendi.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/health-records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete health record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/health-records', personnelId] });
      toast({
        title: "Sağlık kaydı silindi",
        description: "Sağlık bilgisi başarıyla silindi.",
      });
    },
  });

  const handleCreate = () => {
    setEditingRecord(null);
    form.reset({
      personnelId,
      recordType: "health_check",
      reportDate: "",
      doctorName: "",
      hospitalName: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      nextCheckupDate: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: HealthRecord) => {
    setEditingRecord(record);
    form.reset({
      personnelId: record.personnelId,
      recordType: record.recordType,
      reportDate: record.reportDate,
      doctorName: record.doctorName,
      hospitalName: record.hospitalName,
      diagnosis: record.diagnosis,
      treatment: record.treatment || "",
      notes: record.notes || "",
      nextCheckupDate: record.nextCheckupDate || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.reset();
  };

  const onSubmit = async (data: InsertHealthRecord) => {
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ id: editingRecord.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  };

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'health_check': return <CheckCircle className="h-4 w-4" />;
      case 'work_accident': return <AlertTriangle className="h-4 w-4" />;
      case 'occupational_disease': return <Heart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'health_check': return 'bg-green-100 text-green-800';
      case 'work_accident': return 'bg-red-100 text-red-800';
      case 'occupational_disease': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case 'health_check': return 'Sağlık Kontrolü';
      case 'work_accident': return 'İş Kazası';
      case 'occupational_disease': return 'Meslek Hastalığı';
      default: return type;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Sağlık Kayıtları
          </CardTitle>
          <CardDescription>
            Personelin sağlık durumu, kontroller ve raporlar
          </CardDescription>
        </div>
        <Button onClick={handleCreate} size="sm" data-testid="button-add-health">
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : !healthRecords || healthRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz sağlık kaydı bulunmuyor.</p>
            <p className="text-sm">Yeni kayıt eklemek için "Ekle" butonunu kullanın.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Doktor</TableHead>
                <TableHead>Hastane/Klinik</TableHead>
                <TableHead>Tanı</TableHead>
                <TableHead>Sonraki Kontrol</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.reportDate).toLocaleDateString('tr-TR')}</TableCell>
                  <TableCell>
                    <Badge className={`${getRecordTypeColor(record.recordType)} flex items-center gap-1 w-fit`}>
                      {getRecordTypeIcon(record.recordType)}
                      {getRecordTypeLabel(record.recordType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{record.doctorName}</TableCell>
                  <TableCell>{record.hospitalName}</TableCell>
                  <TableCell>{record.diagnosis}</TableCell>
                  <TableCell>
                    {record.nextCheckupDate ? (
                      new Date(record.nextCheckupDate).toLocaleDateString('tr-TR')
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        data-testid={`button-edit-health-${record.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(record.id)}
                        data-testid={`button-delete-health-${record.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {editingRecord ? "Sağlık Kaydını Düzenle" : "Yeni Sağlık Kaydı"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recordType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kayıt Türü *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Tür seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="health_check">Sağlık Kontrolü</SelectItem>
                          <SelectItem value="work_accident">İş Kazası</SelectItem>
                          <SelectItem value="occupational_disease">Meslek Hastalığı</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reportDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rapor Tarihi *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doktor Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Ahmet Yılmaz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospitalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hastane/Klinik *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acıbadem Hastanesi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextCheckupDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sonraki Kontrol Tarihi</FormLabel>
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
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanı/Teşhis *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tanı ve bulgular..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tedavi/İlaç</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Uygulanan tedavi ve ilaçlar..." 
                        rows={2} 
                        {...field} 
                      />
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
                        rows={2} 
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
                    : (editingRecord ? "Güncelle" : "Kaydet")
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