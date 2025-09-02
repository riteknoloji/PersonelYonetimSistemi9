import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  Clock,
  Download,
  Eye,
  Target,
  Info
} from 'lucide-react';

interface AnalyticsData {
  reportUsage: {
    totalReports: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  popularReports: {
    name: string;
    category: string;
    count: number;
    percentage: number;
  }[];
  userActivity: {
    activeUsers: number;
    topUsers: {
      name: string;
      reportsCreated: number;
      lastActive: string;
    }[];
  };
  performanceMetrics: {
    avgGenerationTime: string;
    successRate: number;
    totalDownloads: number;
  };
  categoryBreakdown: {
    category: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  timeDistribution: {
    hour: number;
    count: number;
  }[];
}

export function ReportAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // Mock analytics data
    const mockData: AnalyticsData = {
      reportUsage: {
        totalReports: 156,
        thisMonth: 42,
        lastMonth: 35,
        growth: 20
      },
      popularReports: [
        { name: 'Personel Özeti Raporu', category: 'Personel', count: 28, percentage: 18 },
        { name: 'İzin Analiz Raporu', category: 'İzin', count: 24, percentage: 15 },
        { name: 'Devam Durumu Raporu', category: 'Devam', count: 19, percentage: 12 },
        { name: 'Vardiya Kapsama Raporu', category: 'Vardiya', count: 15, percentage: 10 },
        { name: 'Performans Raporu', category: 'Performans', count: 12, percentage: 8 }
      ],
      userActivity: {
        activeUsers: 12,
        topUsers: [
          { name: 'Admin User', reportsCreated: 23, lastActive: '2025-01-20T11:30:00Z' },
          { name: 'HR Manager', reportsCreated: 18, lastActive: '2025-01-20T10:15:00Z' },
          { name: 'Operations Manager', reportsCreated: 14, lastActive: '2025-01-19T16:45:00Z' },
          { name: 'Finance Manager', reportsCreated: 11, lastActive: '2025-01-19T14:20:00Z' }
        ]
      },
      performanceMetrics: {
        avgGenerationTime: '2.4 saniye',
        successRate: 94.5,
        totalDownloads: 247
      },
      categoryBreakdown: [
        { category: 'Personel', count: 45, percentage: 29, trend: 'up' },
        { category: 'İzin', count: 38, percentage: 24, trend: 'up' },
        { category: 'Devam', count: 32, percentage: 21, trend: 'stable' },
        { category: 'Vardiya', count: 24, percentage: 15, trend: 'down' },
        { category: 'Performans', count: 17, percentage: 11, trend: 'up' }
      ],
      timeDistribution: [
        { hour: 8, count: 12 },
        { hour: 9, count: 18 },
        { hour: 10, count: 24 },
        { hour: 11, count: 21 },
        { hour: 12, count: 8 },
        { hour: 13, count: 6 },
        { hour: 14, count: 15 },
        { hour: 15, count: 19 },
        { hour: 16, count: 16 },
        { hour: 17, count: 12 }
      ]
    };

    setAnalyticsData(mockData);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  if (!analyticsData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Rapor kullanım istatistikleri, popüler raporlar ve performans metriklerini analiz edin.
        </AlertDescription>
      </Alert>

      {/* Time Range Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Raporlama Analitiği</h3>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Son 7 Gün</SelectItem>
                <SelectItem value="30d">Son 30 Gün</SelectItem>
                <SelectItem value="90d">Son 3 Ay</SelectItem>
                <SelectItem value="1y">Son 1 Yıl</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Rapor</p>
                <p className="text-2xl font-bold">{analyticsData.reportUsage.totalReports}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    +{analyticsData.reportUsage.growth}% bu ay
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold">{analyticsData.userActivity.activeUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Bu ay rapor oluşturan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Ortalama Süre</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.avgGenerationTime}</p>
                <p className="text-xs text-gray-500 mt-1">Rapor oluşturma süresi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Başarı Oranı</p>
                <p className="text-2xl font-bold">{analyticsData.performanceMetrics.successRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Başarılı rapor oluşturma</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Reports & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              En Popüler Raporlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.popularReports.map((report, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{report.name}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {report.category}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{report.count}</div>
                    <div className="text-xs text-gray-500">{report.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{category.category}</span>
                      {getTrendIcon(category.trend)}
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{category.count}</span>
                      <span className="text-xs text-gray-500 ml-2">({category.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity & Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              En Aktif Kullanıcılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userActivity.topUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">
                        Son aktiflik: {new Date(user.lastActive).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user.reportsCreated}</div>
                    <div className="text-xs text-gray-500">rapor</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Saatlik Dağılım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.timeDistribution.map((time, index) => {
                const maxCount = Math.max(...analyticsData.timeDistribution.map(t => t.count));
                const percentage = (time.count / maxCount) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium">
                      {time.hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-8 text-sm text-gray-600">{time.count}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-xs text-gray-500">
              * En yoğun saatler: 10:00-11:00 arası
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performans İçgörüleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.performanceMetrics.totalDownloads}
              </div>
              <div className="text-sm text-gray-600">Toplam İndirme</div>
              <div className="text-xs text-gray-500 mt-1">
                Ortalama: {Math.round(analyticsData.performanceMetrics.totalDownloads / analyticsData.reportUsage.totalReports * 10) / 10} per rapor
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-gray-600">Görüntüleme Oranı</div>
              <div className="text-xs text-gray-500 mt-1">
                Rapor oluşturulan vs görüntülenen
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">+24%</div>
              <div className="text-sm text-gray-600">Aylık Artış</div>
              <div className="text-xs text-gray-500 mt-1">
                Önceki aya göre kullanım artışı
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Öneriler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">En Popüler Saatler</div>
                <div className="text-sm text-blue-700">
                  Raporlar genellikle 10:00-11:00 arası oluşturuluyor. Bu saatlerde sistem performansını optimize etmeyi düşünün.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Artan Kullanım</div>
                <div className="text-sm text-green-700">
                  Personel ve İzin kategorilerinde %20+ artış var. Bu kategoriler için yeni şablonlar eklenebilir.
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
              <Target className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-800">İyileştirme Fırsatı</div>
                <div className="text-sm text-orange-700">
                  Vardiya raporlarında kullanım düşüş gösteriyor. Kullanıcı geri bildirimlerini değerlendirin.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}