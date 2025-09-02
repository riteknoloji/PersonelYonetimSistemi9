import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, TrendingDown, Users, Clock, Target, Award } from "lucide-react";
import type { Branch } from "@shared/schema";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// Mock data - gerçek projede API'den gelecek
const performanceData = [
  { name: 'Ana Şube', personnel: 45, attendance: 95, productivity: 87, satisfaction: 92 },
  { name: 'Kadıköy Şube', personnel: 32, attendance: 88, productivity: 82, satisfaction: 89 },
  { name: 'Beyoğlu Şube', personnel: 28, attendance: 92, productivity: 90, satisfaction: 85 },
  { name: 'Ataşehir Şube', personnel: 38, attendance: 89, productivity: 85, satisfaction: 91 },
];

const monthlyTrends = [
  { month: 'Oca', anaşube: 85, kadıköy: 82, beyoğlu: 88, ataşehir: 87 },
  { month: 'Şub', anaşube: 87, kadıköy: 84, beyoğlu: 89, ataşehir: 88 },
  { month: 'Mar', anaşube: 90, kadıköy: 86, beyoğlu: 91, ataşehir: 89 },
  { month: 'Nis', anaşube: 88, kadıköy: 83, beyoğlu: 87, ataşehir: 85 },
  { month: 'May', anaşube: 92, kadıköy: 88, beyoğlu: 93, ataşehir: 91 },
  { month: 'Haz', anaşube: 95, kadıköy: 90, beyoğlu: 94, ataşehir: 92 },
];

const departmentDistribution = [
  { name: 'Satış', value: 35, count: 142 },
  { name: 'Müşteri Hizmetleri', value: 25, count: 98 },
  { name: 'Operasyon', value: 20, count: 76 },
  { name: 'Finans', value: 12, count: 45 },
  { name: 'İnsan Kaynakları', value: 8, count: 32 },
];

export function BranchAnalytics() {
  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['/api/branches'],
  });

  return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Şube</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2 yeni
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Katılım</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +3% geçen ay
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verimlilik</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +1% geçen ay
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memnuniyet</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -1% geçen ay
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performans Karşılaştırması</TabsTrigger>
          <TabsTrigger value="trends">Zaman Serileri</TabsTrigger>
          <TabsTrigger value="distribution">Departman Dağılımı</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Şube Performans Karşılaştırması</CardTitle>
                <CardDescription>
                  Tüm şubelerin ana performans göstergelerinin karşılaştırması
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendance" fill="#8884d8" name="Katılım %" />
                    <Bar dataKey="productivity" fill="#82ca9d" name="Verimlilik %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Şube Detay Metrikleri</CardTitle>
                <CardDescription>
                  Her şube için detaylı performans göstergeleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceData.map((branch, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{branch.name}</span>
                      <Badge variant="outline">
                        {branch.personnel} kişi
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Katılım</div>
                        <Progress value={branch.attendance} className="h-2" />
                        <div className="text-xs text-right mt-1">{branch.attendance}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Verimlilik</div>
                        <Progress value={branch.productivity} className="h-2" />
                        <div className="text-xs text-right mt-1">{branch.productivity}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Memnuniyet</div>
                        <Progress value={branch.satisfaction} className="h-2" />
                        <div className="text-xs text-right mt-1">{branch.satisfaction}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aylık Performans Trendleri</CardTitle>
              <CardDescription>
                Son 6 ayın şube bazlı performans eğilimleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="anaşube" stroke="#8884d8" strokeWidth={2} name="Ana Şube" />
                  <Line type="monotone" dataKey="kadıköy" stroke="#82ca9d" strokeWidth={2} name="Kadıköy" />
                  <Line type="monotone" dataKey="beyoğlu" stroke="#ffc658" strokeWidth={2} name="Beyoğlu" />
                  <Line type="monotone" dataKey="ataşehir" stroke="#ff7300" strokeWidth={2} name="Ataşehir" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Departman Dağılımı</CardTitle>
                <CardDescription>
                  Tüm şubeler genelinde departman bazlı personel dağılımı
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departman Detayları</CardTitle>
                <CardDescription>
                  Departman bazlı personel sayıları ve oranları
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentDistribution.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{dept.count} kişi</div>
                      <div className="text-sm text-muted-foreground">{dept.value}%</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}