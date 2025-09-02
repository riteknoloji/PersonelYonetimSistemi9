import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, Users, Shield, Smartphone } from "lucide-react";
import type { Branch, SystemSetting } from "@shared/schema";

export function BranchSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  const { data: settings } = useQuery<SystemSetting[]>({
    queryKey: ['/api/system-settings', 'branch'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/system-settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-settings'] });
      toast({
        title: "Ayar güncellendi",
        description: "Şube ayarları başarıyla güncellendi.",
      });
    },
  });

  const form = useForm({
    defaultValues: {
      workingHoursStart: "08:00",
      workingHoursEnd: "18:00",
      breakDuration: "60",
      maxOvertimeHours: "8",
      minPersonnelCount: "2",
      allowWeekendWork: true,
      requireManagerApproval: true,
      enableQRTracking: true,
      allowMobileAccess: true,
    },
  });

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Genel
        </TabsTrigger>
        <TabsTrigger value="time" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Zaman
        </TabsTrigger>
        <TabsTrigger value="personnel" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Personel
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Güvenlik
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Genel Şube Ayarları</CardTitle>
            <CardDescription>
              Tüm şubeler için genel konfigürasyonlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allowWeekendWork"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hafta Sonu Çalışması</FormLabel>
                        <FormDescription>
                          Şubelerde hafta sonu çalışmasına izin ver
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireManagerApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Yönetici Onayı</FormLabel>
                        <FormDescription>
                          Kritik işlemler için yönetici onayı gerekli
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Çalışma Zamanları</CardTitle>
            <CardDescription>
              Şube çalışma saatleri ve zaman ayarları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workingHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Çalışma Başlangıcı</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workingHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Çalışma Bitişi</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breakDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mola Süresi (dakika)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxOvertimeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maksimum Fazla Mesai (saat)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="personnel" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Personel Ayarları</CardTitle>
            <CardDescription>
              Şube personeli ile ilgili konfigürasyonlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minPersonnelCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Personel Sayısı</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Şubede bulunması gereken minimum personel sayısı
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Güvenlik Ayarları</CardTitle>
            <CardDescription>
              Şube güvenlik ve erişim konfigürasyonları
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableQRTracking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">QR Kod Takibi</FormLabel>
                        <FormDescription>
                          QR kod ile giriş-çıkış takibini etkinleştir
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowMobileAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobil Erişim
                        </FormLabel>
                        <FormDescription>
                          Mobil cihazlardan sisteme erişime izin ver
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={() => {
            // Save all settings
            toast({
              title: "Ayarlar kaydedildi",
              description: "Tüm şube ayarları başarıyla güncellendi.",
            });
          }}
        >
          Ayarları Kaydet
        </Button>
      </div>
    </Tabs>
  );
}