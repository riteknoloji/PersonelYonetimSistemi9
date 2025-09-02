import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Mail,
  Calendar,
  MoreHorizontal,
  Info,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  category: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    dayOfWeek?: number; // 0=Sunday for weekly
    dayOfMonth?: number; // 1-31 for monthly
    timezone: string;
  };
  recipients: string[];
  format: 'PDF' | 'Excel' | 'CSV';
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  status: 'active' | 'paused' | 'error';
  error?: string;
}

export function ScheduledReports() {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    recipients: [''],
    format: 'PDF',
    isActive: true
  });

  useEffect(() => {
    loadScheduledReports();
  }, []);

  const loadScheduledReports = () => {
    // Mock scheduled reports data
    const mockReports: ScheduledReport[] = [
      {
        id: '1',
        name: 'Haftalık Personel Raporu',
        description: 'Her Pazartesi sabahı departman yöneticilerine gönderilir',
        templateId: 'personnel-summary',
        templateName: 'Personel Özeti Raporu',
        category: 'Personel',
        schedule: {
          frequency: 'weekly',
          time: '08:00',
          dayOfWeek: 1, // Monday
          timezone: 'Europe/Istanbul'
        },
        recipients: ['hr@company.com', 'manager@company.com'],
        format: 'PDF',
        isActive: true,
        createdBy: 'HR Manager',
        createdAt: '2025-01-15T10:00:00Z',
        lastRun: '2025-01-20T08:00:00Z',
        nextRun: '2025-01-27T08:00:00Z',
        runCount: 3,
        status: 'active'
      },
      {
        id: '2',
        name: 'Aylık İzin Analizi',
        description: 'Her ay sonu izin kullanım raporu',
        templateId: 'leave-analysis',
        templateName: 'İzin Analiz Raporu',
        category: 'İzin',
        schedule: {
          frequency: 'monthly',
          time: '17:00',
          dayOfMonth: 30,
          timezone: 'Europe/Istanbul'
        },
        recipients: ['hr@company.com', 'ceo@company.com'],
        format: 'Excel',
        isActive: true,
        createdBy: 'Admin User',
        createdAt: '2025-01-10T14:30:00Z',
        lastRun: '2024-12-30T17:00:00Z',
        nextRun: '2025-01-30T17:00:00Z',
        runCount: 1,
        status: 'active'
      },
      {
        id: '3',
        name: 'Günlük Devam Raporu',
        description: 'Her gün sonu devam durumu özeti',
        templateId: 'attendance-summary',
        templateName: 'Devam Durumu Raporu',
        category: 'Devam',
        schedule: {
          frequency: 'daily',
          time: '18:00',
          timezone: 'Europe/Istanbul'
        },
        recipients: ['operations@company.com'],
        format: 'CSV',
        isActive: false,
        createdBy: 'Operations Manager',
        createdAt: '2025-01-18T11:15:00Z',
        lastRun: '2025-01-19T18:00:00Z',
        nextRun: undefined,
        runCount: 2,
        status: 'paused'
      },
      {
        id: '4',
        name: 'Üçaylık Performans Raporu',
        description: 'Çeyrek dönem performans değerlendirmesi',
        templateId: 'performance-quarterly',
        templateName: 'Performans Raporu',
        category: 'Performans',
        schedule: {
          frequency: 'quarterly',
          time: '09:00',
          dayOfMonth: 1,
          timezone: 'Europe/Istanbul'
        },
        recipients: ['management@company.com', 'board@company.com'],
        format: 'PDF',
        isActive: true,
        createdBy: 'CEO',
        createdAt: '2025-01-05T16:00:00Z',
        lastRun: '2025-01-01T09:00:00Z',
        nextRun: '2025-04-01T09:00:00Z',
        runCount: 1,
        status: 'active'
      },
      {
        id: '5',
        name: 'Vardiya Kapsama Raporu',
        description: 'Haftalık vardiya kapsama analizi - HATA',
        templateId: 'shift-coverage',
        templateName: 'Vardiya Kapsama Raporu',
        category: 'Vardiya',
        schedule: {
          frequency: 'weekly',
          time: '07:00',
          dayOfWeek: 0, // Sunday
          timezone: 'Europe/Istanbul'
        },
        recipients: ['shifts@company.com'],
        format: 'PDF',
        isActive: true,
        createdBy: 'Operations Manager',
        createdAt: '2025-01-12T13:20:00Z',
        lastRun: '2025-01-19T07:00:00Z',
        nextRun: '2025-01-26T07:00:00Z',
        runCount: 2,
        status: 'error',
        error: 'Veri kaynağına erişim hatası'
      }
    ];

    setScheduledReports(mockReports);
  };

  const openCreateModal = () => {
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
      templateId: '',
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      recipients: [''],
      format: 'PDF',
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (report: ScheduledReport) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description,
      templateId: report.templateId,
      frequency: report.schedule.frequency,
      time: report.schedule.time,
      dayOfWeek: report.schedule.dayOfWeek || 1,
      dayOfMonth: report.schedule.dayOfMonth || 1,
      recipients: report.recipients,
      format: report.format,
      isActive: report.isActive
    });
    setModalOpen(true);
  };

  const saveReport = async () => {
    if (!formData.name || !formData.templateId || formData.recipients.some(r => !r.trim())) {
      toast({
        title: "Hata",
        description: "Lütfen tüm gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newReport: ScheduledReport = {
        id: editingReport?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        templateId: formData.templateId,
        templateName: 'Seçilen Şablon',
        category: 'Personel', // This would be determined by template
        schedule: {
          frequency: formData.frequency as any,
          time: formData.time,
          dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : undefined,
          dayOfMonth: ['monthly', 'quarterly'].includes(formData.frequency) ? formData.dayOfMonth : undefined,
          timezone: 'Europe/Istanbul'
        },
        recipients: formData.recipients.filter(r => r.trim()),
        format: formData.format as any,
        isActive: formData.isActive,
        createdBy: 'Current User',
        createdAt: editingReport?.createdAt || new Date().toISOString(),
        nextRun: calculateNextRun(),
        runCount: editingReport?.runCount || 0,
        status: formData.isActive ? 'active' : 'paused'
      };

      if (editingReport) {
        setScheduledReports(prev => prev.map(r => r.id === editingReport.id ? newReport : r));
        toast({
          title: "Rapor Güncellendi",
          description: `${newReport.name} başarıyla güncellendi`,
        });
      } else {
        setScheduledReports(prev => [...prev, newReport]);
        toast({
          title: "Rapor Zamanlandı",
          description: `${newReport.name} başarıyla oluşturuldu`,
        });
      }

      setModalOpen(false);
    } catch (error) {
      console.error('Error saving scheduled report:', error);
      toast({
        title: "Hata",
        description: "Rapor kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNextRun = (): string => {
    const now = new Date();
    // This is a simplified calculation - real implementation would be more complex
    switch (formData.frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'quarterly':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const toggleReportStatus = (reportId: string) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === reportId ? {
        ...report,
        isActive: !report.isActive,
        status: !report.isActive ? 'active' : 'paused'
      } : report
    ));

    const report = scheduledReports.find(r => r.id === reportId);
    toast({
      title: report?.isActive ? "Rapor Duraklatıldı" : "Rapor Etkinleştirildi",
      description: `${report?.name} ${report?.isActive ? 'duraklatıldı' : 'etkinleştirildi'}`,
    });
  };

  const runReportNow = (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId);
    toast({
      title: "Rapor Çalıştırılıyor",
      description: `${report?.name} şimdi oluşturuluyor...`,
    });

    // Update run count and last run time
    setScheduledReports(prev => prev.map(r => 
      r.id === reportId ? {
        ...r,
        lastRun: new Date().toISOString(),
        runCount: r.runCount + 1
      } : r
    ));
  };

  const deleteReport = (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId);
    if (window.confirm(`"${report?.name}" zamanlanmış raporunu silmek istediğinizden emin misiniz?`)) {
      setScheduledReports(prev => prev.filter(r => r.id !== reportId));
      toast({
        title: "Rapor Silindi",
        description: `${report?.name} başarıyla silindi`,
      });
    }
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r)
    }));
  };

  const removeRecipient = (index: number) => {
    if (formData.recipients.length > 1) {
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter((_, i) => i !== index)
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Duraklatıldı</Badge>;
      case 'error':
        return <Badge variant="destructive">Hata</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Günlük';
      case 'weekly': return 'Haftalık';
      case 'monthly': return 'Aylık';
      case 'quarterly': return 'Üçaylık';
      default: return frequency;
    }
  };

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Duraklatıldı';
    return new Date(nextRun).toLocaleString('tr-TR');
  };

  const filteredReports = scheduledReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Raporları otomatik olarak oluşturmak ve e-posta ile göndermek için zamanlayın.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Zamanlama</p>
                <p className="text-2xl font-bold">{scheduledReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Aktif</p>
                <p className="text-2xl font-bold">
                  {scheduledReports.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Hatalar</p>
                <p className="text-2xl font-bold">
                  {scheduledReports.filter(r => r.status === 'error').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Çalışma</p>
                <p className="text-2xl font-bold">
                  {scheduledReports.reduce((sum, r) => sum + r.runCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zamanlanmış rapor ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="paused">Duraklatıldı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Zamanlama
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Rapor Adı</TableHead>
                <TableHead>Sıklık</TableHead>
                <TableHead>Alıcılar</TableHead>
                <TableHead>Son Çalışma</TableHead>
                <TableHead>Sonraki Çalışma</TableHead>
                <TableHead>Çalışma Sayısı</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Filtrelere uygun zamanlanmış rapor bulunamadı.'
                      : 'Henüz zamanlanmış rapor yok. Yeni bir zamanlama oluşturun.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        {getStatusBadge(report.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-gray-600">{report.templateName}</div>
                        {report.error && (
                          <div className="text-xs text-red-600 mt-1" title={report.error}>
                            {report.error.substring(0, 40)}...
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getFrequencyText(report.schedule.frequency)}</div>
                        <div className="text-sm text-gray-600">{report.schedule.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {report.recipients.slice(0, 2).map((recipient, index) => (
                          <div key={index} className="text-sm">{recipient}</div>
                        ))}
                        {report.recipients.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{report.recipients.length - 2} daha
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.lastRun ? (
                        <div className="text-sm">
                          {new Date(report.lastRun).toLocaleString('tr-TR')}
                        </div>
                      ) : (
                        <span className="text-gray-500">Henüz çalışmadı</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatNextRun(report.nextRun)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.runCount}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => runReportNow(report.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Şimdi Çalıştır
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleReportStatus(report.id)}>
                            {report.isActive ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Duraklat
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Etkinleştir
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(report)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteReport(report.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Zamanlamayı Düzenle' : 'Yeni Rapor Zamanlaması'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Rapor Adı *</Label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Örn: Haftalık Personel Raporu"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Rapor hakkında kısa açıklama..."
                  rows={3}
                />
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <Label>Rapor Şablonu *</Label>
              <Select 
                value={formData.templateId} 
                onValueChange={(value) => setFormData(prev => ({...prev, templateId: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şablon seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personnel-summary">Personel Özeti Raporu</SelectItem>
                  <SelectItem value="leave-analysis">İzin Analiz Raporu</SelectItem>
                  <SelectItem value="attendance-summary">Devam Durumu Raporu</SelectItem>
                  <SelectItem value="shift-coverage">Vardiya Kapsama Raporu</SelectItem>
                  <SelectItem value="performance-monthly">Aylık Performans Raporu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Configuration */}
            <div className="border rounded-lg p-4 space-y-4">
              <Label className="text-base font-medium">Zamanlama Ayarları</Label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sıklık</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData(prev => ({...prev, frequency: value as any}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="monthly">Aylık</SelectItem>
                      <SelectItem value="quarterly">Üçaylık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Saat</Label>
                  <Input 
                    type="time" 
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                  />
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <Label>Haftanın Günü</Label>
                  <Select 
                    value={formData.dayOfWeek.toString()} 
                    onValueChange={(value) => setFormData(prev => ({...prev, dayOfWeek: parseInt(value)}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pazar</SelectItem>
                      <SelectItem value="1">Pazartesi</SelectItem>
                      <SelectItem value="2">Salı</SelectItem>
                      <SelectItem value="3">Çarşamba</SelectItem>
                      <SelectItem value="4">Perşembe</SelectItem>
                      <SelectItem value="5">Cuma</SelectItem>
                      <SelectItem value="6">Cumartesi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {['monthly', 'quarterly'].includes(formData.frequency) && (
                <div>
                  <Label>Ayın Günü</Label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={31}
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData(prev => ({...prev, dayOfMonth: parseInt(e.target.value) || 1}))}
                  />
                </div>
              )}
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <Label>E-posta Alıcıları *</Label>
              {formData.recipients.map((recipient, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    type="email"
                    value={recipient}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    placeholder="ornek@company.com"
                    className="flex-1"
                  />
                  {formData.recipients.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removeRecipient(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRecipient}>
                <Plus className="h-4 w-4 mr-2" />
                Alıcı Ekle
              </Button>
            </div>

            {/* Format & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dosya Formatı</Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value) => setFormData(prev => ({...prev, format: value as any}))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
                />
                <Label>Zamanlamayı etkinleştir</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveReport} disabled={loading}>
              {loading ? 'Kaydediliyor...' : (editingReport ? 'Güncelle' : 'Oluştur')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}