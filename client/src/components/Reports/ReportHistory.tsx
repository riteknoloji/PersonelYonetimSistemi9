import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Info,
  MoreHorizontal,
  Share2,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ReportRecord {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'failed' | 'processing';
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadCount: number;
  format: 'PDF' | 'Excel' | 'CSV';
  category: string;
  parameters?: any;
  error?: string;
}

export function ReportHistory() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportHistory();
  }, []);

  const loadReportHistory = () => {
    // Mock report history data
    const mockReports: ReportRecord[] = [
      {
        id: '1',
        name: 'Personel Özeti Raporu',
        type: 'personnel-summary',
        status: 'completed',
        createdBy: 'Admin User',
        createdAt: '2025-01-20T10:30:00Z',
        completedAt: '2025-01-20T10:32:15Z',
        fileSize: '1.2 MB',
        downloadCount: 5,
        format: 'PDF',
        category: 'Personel',
        parameters: { departmentId: 'all', includeInactive: false }
      },
      {
        id: '2',
        name: 'İzin Analiz Raporu',
        type: 'leave-analysis',
        status: 'completed',
        createdBy: 'HR Manager',
        createdAt: '2025-01-20T09:15:00Z',
        completedAt: '2025-01-20T09:18:45Z',
        fileSize: '856 KB',
        downloadCount: 12,
        format: 'Excel',
        category: 'İzin',
        parameters: { startDate: '2025-01-01', endDate: '2025-01-31' }
      },
      {
        id: '3',
        name: 'Vardiya Kapsama Raporu',
        type: 'shift-coverage',
        status: 'failed',
        createdBy: 'Operations Manager',
        createdAt: '2025-01-20T08:45:00Z',
        fileSize: undefined,
        downloadCount: 0,
        format: 'PDF',
        category: 'Vardiya',
        error: 'Veri eksikliği: Bazı vardiya bilgileri bulunamadı'
      },
      {
        id: '4',
        name: 'Devam Durumu Raporu',
        type: 'attendance-summary',
        status: 'processing',
        createdBy: 'Admin User',
        createdAt: '2025-01-20T11:00:00Z',
        fileSize: undefined,
        downloadCount: 0,
        format: 'CSV',
        category: 'Devam'
      },
      {
        id: '5',
        name: 'Aylık Performans Raporu',
        type: 'performance-monthly',
        status: 'completed',
        createdBy: 'HR Manager',
        createdAt: '2025-01-19T16:20:00Z',
        completedAt: '2025-01-19T16:28:10Z',
        fileSize: '2.8 MB',
        downloadCount: 3,
        format: 'PDF',
        category: 'Performans',
        parameters: { month: 'December', year: 2024 }
      },
      {
        id: '6',
        name: 'Maliyet Analiz Raporu',
        type: 'cost-analysis',
        status: 'completed',
        createdBy: 'Finance Manager',
        createdAt: '2025-01-19T14:30:00Z',
        completedAt: '2025-01-19T14:35:20Z',
        fileSize: '1.5 MB',
        downloadCount: 8,
        format: 'Excel',
        category: 'Finansal'
      },
      {
        id: '7',
        name: 'Eğitim ve Gelişim Raporu',
        type: 'training-report',
        status: 'completed',
        createdBy: 'Training Coordinator',
        createdAt: '2025-01-18T10:00:00Z',
        completedAt: '2025-01-18T10:05:30Z',
        fileSize: '640 KB',
        downloadCount: 2,
        format: 'PDF',
        category: 'Eğitim'
      }
    ];

    setReports(mockReports);
  };

  const downloadReport = (report: ReportRecord) => {
    if (report.status !== 'completed') {
      toast({
        title: "İndirilemez",
        description: "Sadece tamamlanmış raporlar indirilebilir",
        variant: "destructive",
      });
      return;
    }

    // Simulate download
    toast({
      title: "İndirme Başladı",
      description: `${report.name} indiriliyor...`,
    });

    // Update download count
    setReports(prev => prev.map(r => 
      r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
    ));
  };

  const shareReport = (report: ReportRecord) => {
    // Copy link to clipboard (mock)
    navigator.clipboard.writeText(`${window.location.origin}/reports/${report.id}`);
    toast({
      title: "Link Kopyalandı",
      description: "Rapor bağlantısı panoya kopyalandı",
    });
  };

  const deleteReport = (report: ReportRecord) => {
    if (window.confirm(`"${report.name}" raporunu silmek istediğinizden emin misiniz?`)) {
      setReports(prev => prev.filter(r => r.id !== report.id));
      toast({
        title: "Rapor Silindi",
        description: `${report.name} başarıyla silindi`,
      });
    }
  };

  const regenerateReport = (report: ReportRecord) => {
    toast({
      title: "Rapor Yeniden Oluşturuluyor",
      description: `${report.name} yeniden oluşturulacak...`,
    });
    
    // Update status to processing
    setReports(prev => prev.map(r => 
      r.id === report.id ? { ...r, status: 'processing' as const } : r
    ));

    // Simulate regeneration
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === report.id ? { 
          ...r, 
          status: 'completed' as const,
          completedAt: new Date().toISOString(),
          fileSize: '1.1 MB'
        } : r
      ));
      toast({
        title: "Rapor Hazır",
        description: `${report.name} yeniden oluşturuldu`,
      });
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Tamamlandı</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">İşleniyor</Badge>;
      case 'failed':
        return <Badge variant="destructive">Başarısız</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      'PDF': 'bg-red-100 text-red-800',
      'Excel': 'bg-green-100 text-green-800',
      'CSV': 'bg-blue-100 text-blue-800'
    };
    return <Badge className={colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{format}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = reportDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  const categories = ['all', ...Array.from(new Set(reports.map(r => r.category)))];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Oluşturulan tüm raporların geçmişini buradan görüntüleyebilir, indirebilir veya yeniden oluşturabilirsiniz.
        </AlertDescription>
      </Alert>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Rapor</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam İndirme</p>
                <p className="text-2xl font-bold">
                  {reports.reduce((sum, r) => sum + r.downloadCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Bu Hafta</p>
                <p className="text-2xl font-bold">
                  {reports.filter(r => {
                    const reportDate = new Date(r.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return reportDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold">
                  {new Set(reports.map(r => r.createdBy)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rapor adı veya oluşturan kişi ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="processing">İşleniyor</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'Tüm Kategoriler' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tarihler</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="week">Bu Hafta</SelectItem>
                  <SelectItem value="month">Bu Ay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rapor Adı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Oluşturan</TableHead>
                <TableHead>Oluşturma Tarihi</TableHead>
                <TableHead>Boyut</TableHead>
                <TableHead>İndirme</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || dateFilter !== 'all'
                      ? 'Filtrelere uygun rapor bulunamadı.'
                      : 'Henüz rapor oluşturulmamış.'
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {report.category}
                        </Badge>
                        {report.error && (
                          <p className="text-xs text-red-600 mt-1" title={report.error}>
                            Hata: {report.error.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{getFormatBadge(report.format)}</TableCell>
                    <TableCell>{report.createdBy}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.fileSize || '-'}</TableCell>
                    <TableCell>{report.downloadCount}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {report.status === 'completed' && (
                            <>
                              <DropdownMenuItem onClick={() => downloadReport(report)}>
                                <Download className="h-4 w-4 mr-2" />
                                İndir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => shareReport(report)}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Paylaş
                              </DropdownMenuItem>
                            </>
                          )}
                          {(report.status === 'failed' || report.status === 'completed') && (
                            <DropdownMenuItem onClick={() => regenerateReport(report)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Yeniden Oluştur
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => deleteReport(report)}
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
    </div>
  );
}