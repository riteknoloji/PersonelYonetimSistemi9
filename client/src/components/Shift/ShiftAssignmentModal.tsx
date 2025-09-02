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
import type { Shift, PersonnelWithRelations } from "@shared/schema";

const shiftAssignmentFormSchema = z.object({
  personnelId: z.string().min(1, "Personel seçimi gereklidir"),
  shiftId: z.string().min(1, "Vardiya seçimi gereklidir"),
  date: z.string().min(1, "Tarih seçimi gereklidir"),
});

type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentFormSchema>;

interface ShiftAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftAssignmentModal({ open, onOpenChange }: ShiftAssignmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ShiftAssignmentFormData>({
    resolver: zodResolver(shiftAssignmentFormSchema),
    defaultValues: {
      personnelId: "",
      shiftId: "",
      date: new Date().toISOString().split('T')[0], // Today's date
    },
  });

  // Fetch personnel
  const { data: personnel = [] } = useQuery<PersonnelWithRelations[]>({
    queryKey: ["/api/personnel"],
  });

  // Fetch shifts
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ["/api/shifts"],
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: ShiftAssignmentFormData) => {
      const payload = {
        personnelId: data.personnelId,
        shiftId: data.shiftId,
        date: data.date,
        isActive: true,
      };
      
      return await apiRequest("POST", "/api/shift-assignments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shift-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Başarılı",
        description: "Vardiya ataması başarıyla oluşturuldu.",
      });
      onOpenChange(false);
      form.reset({
        personnelId: "",
        shiftId: "",
        date: new Date().toISOString().split('T')[0],
      });
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: error.message || "Vardiya ataması oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ShiftAssignmentFormData) => {
    // Validate that the date is not in the past (except today)
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast({
        title: "Hata",
        description: "Geçmiş bir tarihe vardiya ataması yapamazsınız.",
        variant: "destructive",
      });
      return;
    }

    createAssignmentMutation.mutate(data);
  };

  const watchShiftId = form.watch("shiftId");
  const selectedShift = shifts.find(shift => shift.id === watchShiftId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Vardiya Ataması</DialogTitle>
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
                name="shiftId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vardiya *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-shift">
                          <SelectValue placeholder="Vardiya seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.filter(shift => shift.isActive).map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.name}
                            {shift.startTime && shift.endTime && 
                              ` (${shift.startTime.substring(0,5)} - ${shift.endTime.substring(0,5)})`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atama Tarihi *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-assignment-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedShift && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Seçilen Vardiya Detayları:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ad:</span>
                    <span className="ml-2 font-medium">{selectedShift.name}</span>
                  </div>
                  {selectedShift.startTime && selectedShift.endTime && (
                    <div>
                      <span className="text-muted-foreground">Saat:</span>
                      <span className="ml-2 font-medium">
                        {selectedShift.startTime.substring(0,5)} - {selectedShift.endTime.substring(0,5)}
                      </span>
                    </div>
                  )}
                  {selectedShift.workingHours && (
                    <div>
                      <span className="text-muted-foreground">Süre:</span>
                      <span className="ml-2 font-medium">{selectedShift.workingHours} saat</span>
                    </div>
                  )}
                </div>
                {selectedShift.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedShift.description}</p>
                )}
              </div>
            )}

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
                disabled={createAssignmentMutation.isPending}
                data-testid="button-save"
              >
                {createAssignmentMutation.isPending ? "Atanıyor..." : "Vardiya Ata"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}