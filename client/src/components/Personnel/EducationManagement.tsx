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
import { Plus, Edit, Trash2, GraduationCap, Award, BookOpen } from "lucide-react";
import { insertEducationRecordSchema, type EducationRecord, type InsertEducationRecord } from "@shared/schema";
import { z } from "zod";

const formSchema = insertEducationRecordSchema.extend({
  graduationYear: z.coerce.number().min(1950).max(new Date().getFullYear()),
});

type FormData = z.infer<typeof formSchema>;

interface EducationManagementProps {
  personnelId: string;
}

export function EducationManagement({ personnelId }: EducationManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EducationRecord | null>(null);

  const { data: educationRecords, isLoading } = useQuery<EducationRecord[]>({
    queryKey: ['/api/education-records', personnelId],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnelId,
      schoolName: "",
      department: "",
      degree: "",
      graduationYear: new Date().getFullYear(),
      gpa: 0,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEducationRecord) => {
      const response = await fetch('/api/education-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create education record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/education-records', personnelId] });
      handleCloseModal();
      toast({
        title: "Eğitim kaydı eklendi",
        description: "Eğitim bilgisi başarıyla kaydedildi.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEducationRecord> }) => {
      const response = await fetch(`/api/education-records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update education record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/education-records', personnelId] });
      handleCloseModal();
      toast({
        title: "Eğitim kaydı güncellendi",
        description: "Eğitim bilgisi başarıyla güncellendi.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/education-records/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete education record');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/education-records', personnelId] });
      toast({
        title: "Eğitim kaydı silindi",
        description: "Eğitim bilgisi başarıyla silindi.",
      });
    },
  });

  const handleCreate = () => {
    setEditingRecord(null);
    form.reset({
      personnelId,
      schoolName: "",
      department: "",
      degree: "",
      graduationYear: new Date().getFullYear(),
      gpa: 0,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: EducationRecord) => {
    setEditingRecord(record);
    form.reset({
      personnelId: record.personnelId,
      schoolName: record.schoolName,
      department: record.department,
      degree: record.degree,
      graduationYear: record.graduationYear,
      gpa: record.gpa || 0,
      notes: record.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.reset();
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ id: editingRecord.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving education record:', error);
    }
  };

  const getDegreeColor = (degree: string) => {
    switch (degree.toLowerCase()) {
      case 'lisans': return 'bg-blue-100 text-blue-800';
      case 'yüksek lisans': return 'bg-green-100 text-green-800';
      case 'doktora': return 'bg-purple-100 text-purple-800';
      case 'lise': return 'bg-gray-100 text-gray-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Eğitim Bilgileri
          </CardTitle>
          <CardDescription>
            Personelin eğitim geçmişi ve akademik başarıları
          </CardDescription>
        </div>
        <Button onClick={handleCreate} size="sm" data-testid="button-add-education">
          <Plus className="h-4 w-4 mr-2" />
          Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Yükleniyor...</div>
        ) : !educationRecords || educationRecords.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Henüz eğitim kaydı bulunmuyor.</p>
            <p className="text-sm">Yeni kayıt eklemek için "Ekle" butonunu kullanın.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Okul / Kurum</TableHead>
                <TableHead>Bölüm</TableHead>
                <TableHead>Derece</TableHead>
                <TableHead>Mezuniyet</TableHead>
                <TableHead>Not Ort.</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {educationRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.schoolName}</TableCell>
                  <TableCell>{record.department}</TableCell>
                  <TableCell>
                    <Badge className={getDegreeColor(record.degree)}>
                      {record.degree}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.graduationYear}</TableCell>
                  <TableCell>
                    {record.gpa ? (
                      <Badge variant="outline">
                        {record.gpa.toFixed(2)}
                      </Badge>
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
                        data-testid={`button-edit-education-${record.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(record.id)}
                        data-testid={`button-delete-education-${record.id}`}
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {editingRecord ? "Eğitim Kaydını Düzenle" : "Yeni Eğitim Kaydı"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Okul / Kurum Adı *</FormLabel>
                      <FormControl>
                        <Input placeholder="İstanbul Üniversitesi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bölüm *</FormLabel>
                      <FormControl>
                        <Input placeholder="Bilgisayar Mühendisliği" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Derece *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Derece seçin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Lise">Lise</SelectItem>
                          <SelectItem value="Ön Lisans">Ön Lisans</SelectItem>
                          <SelectItem value="Lisans">Lisans</SelectItem>
                          <SelectItem value="Yüksek Lisans">Yüksek Lisans</SelectItem>
                          <SelectItem value="Doktora">Doktora</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mezuniyet Yılı *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1950" max={new Date().getFullYear()} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpa"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Not Ortalaması</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="4" 
                          step="0.01" 
                          placeholder="3.25" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ek bilgiler..." 
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