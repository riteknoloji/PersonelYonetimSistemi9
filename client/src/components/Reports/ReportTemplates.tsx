import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileBarChart, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp,
  Download,
  Play,
  Search,
  Filter,
  Info,
  Eye
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  iconColor: string;
  bgColor: string;
  isPopular: boolean;
  estimatedTime: string;
  dataPoints: string[];
  lastUsed?: string;
}

export function ReportTemplates() {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Predefined report templates
    const predefinedTemplates: ReportTemplate[] = [
      {
        id: 'personnel-summary',
        name: 'Personel Özeti Raporu',
        description: 'Tüm personellerin genel bilgileri, departman dağılımı ve istatistikleri',
        category: 'Personel',
        icon: Users,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        isPopular: true,
        estimatedTime: '2-3 dakika',
        dataPoints: ['Toplam Personel', 'Departman Dağılımı', 'Pozisyon Analizi', 'İşe Başlama Tarihleri'],
        lastUsed: '2025-01-19'
      },
      {
        id: 'attendance-summary',
        name: 'Devam Durumu Raporu',
        description: 'Personel devam durumu, geç kalma ve erken ayrılma analizi',
        category: 'Devam',
        icon: Clock,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-50',
        isPopular: true,
        estimatedTime: '1-2 dakika',
        dataPoints: ['Günlük Devam', 'Geç Kalma', 'Erken Ayrılma', 'Devam Oranları'],
        lastUsed: '2025-01-20'
      },
      {
        id: 'leave-analysis',
        name: 'İzin Analiz Raporu',
        description: 'İzin kullanım istatistikleri, bakiye durumu ve trend analizi',
        category: 'İzin',
        icon: Calendar,
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-50',
        isPopular: true,
        estimatedTime: '3-4 dakika',
        dataPoints: ['İzin Kullanımı', 'Bakiye Durumu', 'İzin Türleri', 'Departman Karşılaştırması'],
        lastUsed: '2025-01-18'
      },
      {
        id: 'shift-coverage',
        name: 'Vardiya Kapsama Raporu',
        description: 'Vardiya planlaması, kapsam oranları ve eksik personel analizi',
        category: 'Vardiya',
        icon: Clock,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        isPopular: false,
        estimatedTime: '2-3 dakika',
        dataPoints: ['Vardiya Planı', 'Kapsam Oranı', 'Eksik Personel', 'Çalışma Saatleri'],
        lastUsed: '2025-01-17'
      },
      {
        id: 'performance-monthly',
        name: 'Aylık Performans Raporu',
        description: 'Departman bazında aylık performans değerlendirmesi ve karşılaştırma',
        category: 'Performans',
        icon: TrendingUp,
        iconColor: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        isPopular: false,
        estimatedTime: '4-5 dakika',
        dataPoints: ['Performans Skorları', 'Departman Karşılaştırması', 'Hedef Başarım', 'Trend Analizi']
      },
      {
        id: 'cost-analysis',
        name: 'Maliyet Analiz Raporu',
        description: 'İnsan kaynakları maliyeti, ek mesai ve prim analizi',
        category: 'Finansal',
        icon: TrendingUp,
        iconColor: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        isPopular: false,
        estimatedTime: '3-4 dakika',
        dataPoints: ['Maaş Maliyeti', 'Ek Mesai', 'Primler', 'Toplam Maliyet']
      },
      {
        id: 'training-report',
        name: 'Eğitim ve Gelişim Raporu',
        description: 'Personel eğitim durumu, sertifikalar ve gelişim planları',
        category: 'Eğitim',
        icon: FileBarChart,
        iconColor: 'text-pink-600',
        bgColor: 'bg-pink-50',
        isPopular: false,
        estimatedTime: '2-3 dakika',
        dataPoints: ['Eğitim Durumu', 'Sertifikalar', 'Gelişim Planları', 'Eğitim Maliyeti']
      },
      {
        id: 'compliance-report',
        name: 'Uyumluluk Raporu',
        description: 'İş kanunu uyumluluk, sağlık raporu ve belge durumu analizi',
        category: 'Uyumluluk',
        icon: FileBarChart,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        isPopular: false,
        estimatedTime: '5-6 dakika',
        dataPoints: ['Belge Durumu', 'Sağlık Raporları', 'İş Kanunu Uyumluluk', 'Eksik Belgeler']
      }
    ];

    setTemplates(predefinedTemplates);
  };

  const generateReport = async (template: ReportTemplate) => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rapor Oluşturuldu",
        description: `${template.name} başarıyla oluşturuldu ve indirme başladı`,
      });

      // Update last used date
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, lastUsed: new Date().toISOString().split('T')[0] } : t
      ));
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Hata",
        description: "Rapor oluşturulurken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const previewReport = (template: ReportTemplate) => {
    toast({
      title: "Önizleme",
      description: `${template.name} önizlemesi açılıyor...`,
    });
    // In a real implementation, this would open a preview modal
  };

  const categories = ['all', 'Personel', 'Devam', 'İzin', 'Vardiya', 'Performans', 'Finansal', 'Eğitim', 'Uyumluluk'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = filteredTemplates.filter(t => t.isPopular);
  const otherTemplates = filteredTemplates.filter(t => !t.isPopular);

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rapor şablonu ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
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
          </div>
        </CardContent>
      </Card>

      {/* Popular Templates */}
      {popularTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Popüler Rapor Şablonları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`h-2 w-full ${template.bgColor}`}></div>
                  {template.isPopular && (
                    <Badge className="absolute top-3 right-3 bg-yellow-100 text-yellow-800">
                      Popüler
                    </Badge>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${template.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{template.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Tahmini süre: {template.estimatedTime}</span>
                      </div>
                      {template.lastUsed && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Son kullanım: {new Date(template.lastUsed).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">İçerik:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.dataPoints.slice(0, 3).map((point, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                        {template.dataPoints.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.dataPoints.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => generateReport(template)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {loading ? 'Oluşturuluyor...' : 'Oluştur'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => previewReport(template)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Other Templates */}
      {otherTemplates.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Diğer Rapor Şablonları</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${template.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{template.estimatedTime}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => generateReport(template)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Oluştur
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Şablon İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Toplam Şablon</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{popularTemplates.length}</div>
              <div className="text-sm text-gray-600">Popüler Şablon</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(templates.map(t => t.category)).size}
              </div>
              <div className="text-sm text-gray-600">Kategori</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {templates.filter(t => t.lastUsed).length}
              </div>
              <div className="text-sm text-gray-600">Kullanılmış</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}