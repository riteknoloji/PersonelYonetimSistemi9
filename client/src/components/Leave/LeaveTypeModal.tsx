import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LeaveTypesList } from "./LeaveTypesList";

const leaveTypeFormSchema = z.object({
  name: z.string().min(1, "İzin türü adı gereklidir"),
  description: z.string().optional(),
  maxDays: z.string().optional(),
  isActive: z.boolean().default(true),
});

type LeaveTypeFormData = z.infer<typeof leaveTypeFormSchema>;

interface LeaveTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveTypeModal({ open, onOpenChange }: LeaveTypeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      maxDays: "",
      isActive: true,
    },
  });

  const createLeaveTypeMutation = useMutation({
    mutationFn: async (data: LeaveTypeFormData) => {
      const payload = {
        name: data.name,
        description: data.description || null,
        maxDays: data.maxDays ? parseFloat(data.maxDays) : null,
        isActive: data.isActive,
      };
      
      return await apiRequest("POST", "/api/leave-types", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-types"] });
      toast({
        title: "Başarılı",
        description: "İzin türü başarıyla oluşturuldu.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "İzin türü oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveTypeFormData) => {
    createLeaveTypeMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>İzin Türleri Yönetimi</DialogTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              data-testid="button-toggle-form"
            >
              {showForm ? "Formu Kapat" : "Yeni İzin Türü Ekle"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {showForm && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Yeni İzin Türü</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İzin Türü Adı *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Yıllık İzin, Hastalık İzni vb." 
                              {...field} 
                              data-testid="input-leave-type-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maksimum Gün Sayısı</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="30" 
                              {...field} 
                              data-testid="input-max-days"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="İzin türü hakkında açıklama (isteğe bağlı)"
                            className="resize-none"
                            {...field} 
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Aktif Durum</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Bu izin türü kullanıma açık mı?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-is-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel-form"
                    >
                      İptal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createLeaveTypeMutation.isPending}
                      data-testid="button-save-leave-type"
                    >
                      {createLeaveTypeMutation.isPending ? "Ekleniyor..." : "İzin Türü Ekle"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          <LeaveTypesList />
        </div>
      </DialogContent>
    </Dialog>
  );
}