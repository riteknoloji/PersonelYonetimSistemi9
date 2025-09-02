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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LeaveType, PersonnelWithRelations } from "@shared/schema";

const leaveRequestFormSchema = z.object({
  personnelId: z.string().min(1, "Personel seçimi gereklidir"),
  leaveTypeId: z.string().min(1, "İzin türü seçimi gereklidir"),
  startDate: z.string().min(1, "Başlangıç tarihi gereklidir"),
  endDate: z.string().min(1, "Bitiş tarihi gereklidir"),
  reason: z.string().optional(),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestFormSchema>;

interface LeaveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestModal({ open, onOpenChange }: LeaveRequestModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: {
      personnelId: "",
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Fetch personnel
  const { data: personnel = [] } = useQuery<PersonnelWithRelations[]>({
    queryKey: ["/api/personnel"],
  });

  // Fetch leave types
  const { data: leaveTypes = [] } = useQuery<LeaveType[]>({
    queryKey: ["/api/leave-types"],
  });

  // Calculate days between dates
  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both dates
  };

  const createLeaveRequestMutation = useMutation({
    mutationFn: async (data: LeaveRequestFormData) => {
      const days = calculateDays(data.startDate, data.endDate);
      
      const payload = {
        personnelId: data.personnelId,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        days: days.toString(),
        reason: data.reason || null,
        status: "pending",
      };
      
      return await apiRequest("POST", "/api/leave-requests", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Başarılı",
        description: "İzin talebi başarıyla oluşturuldu.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "İzin talebi oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    // Validate dates
    if (new Date(data.startDate) > new Date(data.endDate)) {
      toast({
        title: "Hata",
        description: "Başlangıç tarihi bitiş tarihinden sonra olamaz.",
        variant: "destructive",
      });
      return;
    }

    createLeaveRequestMutation.mutate(data);
  };

  const watchStartDate = form.watch("startDate");
  const watchEndDate = form.watch("endDate");
  const calculatedDays = watchStartDate && watchEndDate ? calculateDays(watchStartDate, watchEndDate) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni İzin Talebi</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="personnelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personel *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-personnel">
                          <SelectValue placeholder="Personel seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {personnel.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.firstName} {person.lastName} ({person.employeeId})
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
                name="leaveTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İzin Türü *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-leave-type">
                          <SelectValue placeholder="İzin türü seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                            {type.maxDays && ` (Max: ${type.maxDays} gün)`}
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
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Tarihi *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-start-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Tarihi *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-end-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculatedDays > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Toplam İzin Günü: <span className="font-medium text-foreground">{calculatedDays} gün</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="İzin sebebini belirtiniz (isteğe bağlı)"
                      className="resize-none"
                      {...field} 
                      data-testid="textarea-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createLeaveRequestMutation.isPending}
                data-testid="button-save"
              >
                {createLeaveRequestMutation.isPending ? "Oluşturuluyor..." : "İzin Talebi Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}