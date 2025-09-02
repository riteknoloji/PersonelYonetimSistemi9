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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Department, Branch, PersonnelWithRelations } from "@shared/schema";

const personnelFormSchema = z.object({
  employeeId: z.string().min(1, "Personel ID gereklidir"),
  firstName: z.string().min(1, "Ad gereklidir"),
  lastName: z.string().min(1, "Soyad gereklidir"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
  phone: z.string().optional(),
  tcNo: z.string().optional(),
  departmentId: z.string().optional(),
  branchId: z.string().optional(),
  position: z.string().optional(),
  salary: z.string().optional(),
  hireDate: z.string().optional(),
  status: z.enum(["active", "inactive", "terminated"]).default("active"),
});

type PersonnelFormData = z.infer<typeof personnelFormSchema>;

interface PersonnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel?: PersonnelWithRelations;
  mode: "create" | "edit";
}

export function PersonnelModal({ open, onOpenChange, personnel, mode }: PersonnelModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelFormSchema),
    defaultValues: {
      employeeId: personnel?.employeeId || "",
      firstName: personnel?.firstName || "",
      lastName: personnel?.lastName || "",
      email: personnel?.email || "",
      phone: personnel?.phone || "",
      tcNo: personnel?.tcNo || "",
      departmentId: personnel?.departmentId || "",
      branchId: personnel?.branchId || "",
      position: personnel?.position || "",
      salary: personnel?.salary || "",
      hireDate: personnel?.hireDate || "",
      status: personnel?.status || "active",
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ["/api/departments"],
  });

  // Fetch branches
  const { data: branches = [] } = useQuery({
    queryKey: ["/api/branches"],
  });

  const createPersonnelMutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        tcNo: data.tcNo || null,
        departmentId: data.departmentId || null,
        branchId: data.branchId || null,
        position: data.position || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        hireDate: data.hireDate || null,
      };
      return await apiRequest("POST", "/api/personnel", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Başarılı",
        description: "Personel başarıyla eklendi.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Personel eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const updatePersonnelMutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        tcNo: data.tcNo || null,
        departmentId: data.departmentId || null,
        branchId: data.branchId || null,
        position: data.position || null,
        salary: data.salary ? parseFloat(data.salary) : null,
        hireDate: data.hireDate || null,
      };
      return await apiRequest("PUT", `/api/personnel/${personnel?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personnel"] });
      toast({
        title: "Başarılı",
        description: "Personel bilgileri başarıyla güncellendi.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Personel güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PersonnelFormData) => {
    if (mode === "create") {
      createPersonnelMutation.mutate(data);
    } else {
      updatePersonnelMutation.mutate(data);
    }
  };

  const isLoading = createPersonnelMutation.isPending || updatePersonnelMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Yeni Personel Ekle" : "Personel Düzenle"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personel ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="PER001" {...field} data-testid="input-employee-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                        <SelectItem value="terminated">İşten Ayrılmış</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ahmet" {...field} data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad *</FormLabel>
                    <FormControl>
                      <Input placeholder="Yılmaz" {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="ahmet@example.com" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input placeholder="0532 123 45 67" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tcNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TC Kimlik No</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678901" {...field} data-testid="input-tc-no" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pozisyon</FormLabel>
                    <FormControl>
                      <Input placeholder="Yazılım Geliştirici" {...field} data-testid="input-position" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departman</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Departman seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept: Department) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-branch">
                          <SelectValue placeholder="Şube seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches.map((branch: Branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maaş (TL)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="15000" 
                        {...field} 
                        data-testid="input-salary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hireDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşe Başlama Tarihi</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-hire-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-save"
              >
                {isLoading ? "Kaydediliyor..." : mode === "create" ? "Kaydet" : "Güncelle"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
