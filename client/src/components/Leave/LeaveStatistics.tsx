import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Info,
  Search
} from 'lucide-react';

interface LeaveBalance {
  leaveType: {
    id: string;
    name: string;
    maxDaysPerYear: number;
  };
  usedDays: number;
  remainingDays: number;
  carryOverDays: number;
  totalAvailable: number;
}

interface EmployeeBalance {
  personnelId: string;
  year: string;
  balances: LeaveBalance[];
  totalUsedDays: number;
}

interface LeaveStatistic {
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  totalDaysUsed: number;
  averageLeaveDays: number;
}

export function LeaveStatistics() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeBalance, setEmployeeBalance] = useState<EmployeeBalance | null>(null);
  const [leaveStatistics, setLeaveStatistics] = useState<LeaveStatistic | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEmployees();
    loadLeaveStatistics();
  }, [selectedYear]);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeBalance();
    }
  }, [selectedEmployee, selectedYear]);

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/personnel');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadLeaveStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/leave-requests');
      if (response.ok) {
        const allLeaves = await response.json();
        
        // Filter by year
        const yearLeaves = allLeaves.filter((leave: any) => 
          new Date(leave.startDate).getFullYear().toString() === selectedYear
        );

        const statistics = {
          totalRequests: yearLeaves.length,
          approvedRequests: yearLeaves.filter((leave: any) => leave.status === 'approved').length,
          pendingRequests: yearLeaves.filter((leave: any) => leave.status === 'pending').length,
          rejectedRequests: yearLeaves.filter((leave: any) => leave.status === 'rejected').length,
          totalDaysUsed: yearLeaves
            .filter((leave: any) => leave.status === 'approved')
            .reduce((total: number, leave: any) => {
              const start = new Date(leave.startDate);
              const end = new Date(leave.endDate);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              return total + days;
            }, 0),
          averageLeaveDays: 0
        };

        if (yearLeaves.filter((leave: any) => leave.status === 'approved').length > 0) {
          statistics.averageLeaveDays = Math.round(
            statistics.totalDaysUsed / yearLeaves.filter((leave: any) => leave.status === 'approved').length
          );
        }

        setLeaveStatistics(statistics);
      }
    } catch (error) {
      console.error('Error loading leave statistics:', error);
      setMessage('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeBalance = async () => {
    if (!selectedEmployee) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/leave-balance/${selectedEmployee}?year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeBalance(data);
      } else {
        setMessage('Personel bakiye bilgileri alınamadı');
      }
    } catch (error) {
      console.error('Error loading employee balance:', error);
      setMessage('Personel bakiye bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const validateLeaveRequest = async () => {
    if (!selectedEmployee) {
      setMessage('Lütfen önce bir personel seçin');
      return;
    }

    // This would typically be called from a form, but for demo purposes
    const mockRequest = {
      personnelId: selectedEmployee,
      leaveTypeId: 'annual-leave-id', // You'd get this from a form
      startDate: '2025-02-01',
      endDate: '2025-02-05'
    };

    try {
      const response = await fetch('/api/leave-requests/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockRequest)
      });

      if (response.ok) {
        const validation = await response.json();
        console.log('Validation result:', validation);
        // You would display this in the UI
      }
    } catch (error) {
      console.error('Error validating leave request:', error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getBalanceColor = (balance: LeaveBalance) => {
    const usagePercentage = (balance.usedDays / balance.leaveType.maxDaysPerYear) * 100;
    if (usagePercentage < 50) return 'text-green-600';
    if (usagePercentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBalanceBadgeColor = (balance: LeaveBalance) => {
    const usagePercentage = (balance.usedDays / balance.leaveType.maxDaysPerYear) * 100;
    if (usagePercentage < 50) return 'bg-green-100 text-green-800';
    if (usagePercentage < 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 2 + i).toString());

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>İstatistik Filtreleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Yıl</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Personel Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ad veya soyad..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label>Personel Seçin</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {filteredEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Statistics */}
      {leaveStatistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Toplam Talep</p>
                  <p className="text-2xl font-bold">{leaveStatistics.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Onaylanan</p>
                  <p className="text-2xl font-bold">{leaveStatistics.approvedRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Beklemede</p>
                  <p className="text-2xl font-bold">{leaveStatistics.pendingRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Ortalama Gün</p>
                  <p className="text-2xl font-bold">{leaveStatistics.averageLeaveDays}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Balance Details */}
      {employeeBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personel İzin Bakiyesi - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">
                  {employees.find(emp => emp.id === selectedEmployee)?.firstName} {' '}
                  {employees.find(emp => emp.id === selectedEmployee)?.lastName}
                </h4>
                <Badge className="bg-blue-100 text-blue-800">
                  Toplam Kullanılan: {employeeBalance.totalUsedDays} gün
                </Badge>
              </div>
            </div>
            
            <div className="grid gap-4">
              {employeeBalance.balances.map((balance, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium">{balance.leaveType.name}</h5>
                    <Badge className={getBalanceBadgeColor(balance)}>
                      {Math.round((balance.usedDays / balance.leaveType.maxDaysPerYear) * 100)}% kullanılmış
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {balance.leaveType.maxDaysPerYear}
                      </div>
                      <div className="text-gray-600">Toplam Hak</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-lg font-semibold ${getBalanceColor(balance)}`}>
                        {balance.usedDays}
                      </div>
                      <div className="text-gray-600">Kullanılan</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {balance.remainingDays}
                      </div>
                      <div className="text-gray-600">Kalan</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {balance.carryOverDays}
                      </div>
                      <div className="text-gray-600">Devir</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-600">
                        {balance.totalAvailable}
                      </div>
                      <div className="text-gray-600">Toplam Müsait</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          balance.usedDays / balance.leaveType.maxDaysPerYear < 0.5 ? 'bg-green-500' :
                          balance.usedDays / balance.leaveType.maxDaysPerYear < 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (balance.usedDays / balance.leaveType.maxDaysPerYear) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {balance.usedDays >= balance.leaveType.maxDaysPerYear * 0.8 && (
                    <div className="mt-2 flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Yıllık iznin %80'inden fazlası kullanıldı</span>
                    </div>
                  )}
                  
                  {balance.remainingDays <= 5 && balance.remainingDays > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-amber-600">
                      <Info className="h-4 w-4" />
                      <span className="text-sm">Kalan izin günü sayısı az ({balance.remainingDays} gün)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              İzin Türleri Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employeeBalance ? (
              <div className="space-y-3">
                {employeeBalance.balances
                  .sort((a, b) => b.usedDays - a.usedDays)
                  .map((balance, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{balance.leaveType.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ 
                              width: `${balance.leaveType.maxDaysPerYear > 0 ? 
                                (balance.usedDays / balance.leaveType.maxDaysPerYear) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">
                          {balance.usedDays} gün
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Personel seçin</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              İzin Durumu Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaveStatistics ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Onaylanan</span>
                  </div>
                  <span className="font-medium">{leaveStatistics.approvedRequests}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Beklemede</span>
                  </div>
                  <span className="font-medium">{leaveStatistics.pendingRequests}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Reddedilen</span>
                  </div>
                  <span className="font-medium">{leaveStatistics.rejectedRequests}</span>
                </div>
                
                <hr className="my-4" />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{leaveStatistics.totalDaysUsed}</div>
                  <div className="text-sm text-gray-600">Toplam Kullanılan Gün ({selectedYear})</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Veri yükleniyor...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}