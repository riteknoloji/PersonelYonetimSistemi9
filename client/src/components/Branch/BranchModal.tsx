import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { insertBranchSchema, type InsertBranch, type Branch, type User } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBranchSchema.extend({
  managerId: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch?: Branch | null;
  onSuccess: () => void;
}

export function BranchModal({ isOpen, onClose, branch, onSuccess }: BranchModalProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/personnel'], // Get potential managers
    enabled: isOpen,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: branch?.name || "",
      address: branch?.address || "",
      phone: branch?.phone || "",
      email: branch?.email || "",
      managerId: branch?.managerId || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertBranch) => {
      const response = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create branch');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertBranch>) => {
      const response = await fetch(`/api/branches/${branch?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update branch');
      return response.json();
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (branch) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/branches'] });
      onSuccess();
    } catch (error) {
      console.error('Error saving branch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {branch ? "Şube Düzenle" : "Yeni Şube Oluştur"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube Adı *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ana Şube" 
                        {...field} 
                        data-testid="input-branch-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şube Yöneticisi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-branch-manager">
                          <SelectValue placeholder="Yönetici seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Yönetici atanmamış</SelectItem>
                        {users?.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Şube adresi..." 
                      rows={3} 
                      {...field} 
                      data-testid="textarea-branch-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(0212) 555 00 00" 
                        {...field} 
                        data-testid="input-branch-phone"
                      />
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
                        placeholder="sube@sirket.com" 
                        {...field} 
                        data-testid="input-branch-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                data-testid="button-save-branch"
              >
                {isLoading ? "Kaydediliyor..." : (branch ? "Güncelle" : "Oluştur")}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-branch"
              >
                İptal
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}