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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const shiftFormSchema = z.object({
  name: z.string().min(1, "Vardiya adı gereklidir"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Başlangıç saati gereklidir"),
  endTime: z.string().min(1, "Bitiş saati gereklidir"),
  workingHours: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ShiftFormData = z.infer<typeof shiftFormSchema>;

interface ShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftModal({ open, onOpenChange }: ShiftModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      workingHours: "",
      isActive: true,
    },
  });

  // Calculate working hours automatically
  const calculateWorkingHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;
    
    // If end time is earlier than start time, assume next day
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60;
    }
    
    const diffMinutes = endTotalMinutes - startTotalMinutes;
    return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal place
  };

  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      const workingHours = calculateWorkingHours(data.startTime, data.endTime);
      
      const payload = {
        name: data.name,
        description: data.description || null,
        startTime: data.startTime,
        endTime: data.endTime,
        workingHours: workingHours.toString(),
        isActive: data.isActive,
      };
      
      return await apiRequest("POST", "/api/shifts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shifts"] });
      toast({
        title: "Başarılı",
        description: "Vardiya başarıyla oluşturuldu.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Vardiya oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShiftFormData) => {
    // Validate times
    if (data.startTime === data.endTime) {
      toast({
        title: "Hata",
        description: "Başlangıç ve bitiş saatleri aynı olamaz.",
        variant: "destructive",
      });
      return;
    }

    createShiftMutation.mutate(data);
  };

  const watchStartTime = form.watch("startTime");
  const watchEndTime = form.watch("endTime");
  const calculatedHours = watchStartTime && watchEndTime ? calculateWorkingHours(watchStartTime, watchEndTime) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Vardiya Tanımla</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vardiya Adı *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sabah Vardiyası, Gece Vardiyası vb." 
                        {...field} 
                        data-testid="input-shift-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workingHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çalışma Saatleri</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.5"
                        placeholder="8"
                        {...field}
                        value={calculatedHours > 0 ? calculatedHours.toString() : field.value}
                        readOnly
                        className="bg-muted"
                        data-testid="input-working-hours"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Başlangıç Saati *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        data-testid="input-start-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bitiş Saati *</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                        data-testid="input-end-time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {calculatedHours > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Hesaplanan Çalışma Süresi: <span className="font-medium text-foreground">{calculatedHours} saat</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Vardiya hakkında açıklama (isteğe bağlı)"
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
                      Bu vardiya kullanıma açık mı?
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
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={createShiftMutation.isPending}
                data-testid="button-save"
              >
                {createShiftMutation.isPending ? "Oluşturuluyor..." : "Vardiya Oluştur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}