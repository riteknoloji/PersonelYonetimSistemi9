import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Users,
  TrendingUp,
  Info
} from 'lucide-react';

interface LeaveEvent {
  id: string;
  personnelId: string;
  personnelName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface CoverageDay {
  date: string;
  totalStaff: number;
  onLeave: number;
  available: number;
  coveragePercentage: number;
  isAdequate: boolean;
  onLeaveDetails: {
    personnelId: string;
    personnelName: string;
    leaveType: string;
  }[];
}

export function LeaveCalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>([]);
  const [coverageData, setCoverageData] = useState<CoverageDay[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCalendarData();
    loadDepartments();
  }, [currentMonth, selectedDepartment]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      // Get month range
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      // Load leave requests
      const leaveResponse = await fetch('/api/leave-requests');
      if (leaveResponse.ok) {
        const allLeaves = await leaveResponse.json();
        const monthlyLeaves = allLeaves
          .filter((leave: any) => 
            leave.status === 'approved' &&
            new Date(leave.startDate) <= new Date(endDate) &&
            new Date(leave.endDate) >= new Date(startDate)
          )
          .map((leave: any) => ({
            id: leave.id,
            personnelId: leave.personnelId,
            personnelName: leave.personnel?.firstName + ' ' + leave.personnel?.lastName,
            leaveType: leave.leaveType?.name || 'Unknown',
            startDate: leave.startDate,
            endDate: leave.endDate,
            status: leave.status
          }));
        setLeaveEvents(monthlyLeaves);
      }

      // Load coverage data if department is selected
      if (selectedDepartment !== 'all') {
        const coverageResponse = await fetch(
          `/api/leave-coverage/${selectedDepartment}?startDate=${startDate}&endDate=${endDate}`
        );
        if (coverageResponse.ok) {
          const coverage = await coverageResponse.json();
          setCoverageData(coverage.coverage);
        }
      }

    } catch (error) {
      console.error('Error loading calendar data:', error);
      setMessage('Takvim verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(current);
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        
        // Get leaves for this date
        const dayLeaves = leaveEvents.filter(leave => 
          new Date(leave.startDate) <= currentDate && 
          new Date(leave.endDate) >= currentDate
        );

        // Get coverage for this date
        const dayCoverage = coverageData.find(coverage => coverage.date === dateStr);
        
        weekDays.push({
          date: currentDate,
          dateStr,
          isCurrentMonth,
          leaves: dayLeaves,
          coverage: dayCoverage
        });
        
        current.setDate(current.getDate() + 1);
      }
      days.push(weekDays);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newDate);
  };

  const getCoverageColor = (coverage?: CoverageDay) => {
    if (!coverage) return 'bg-gray-50';
    if (coverage.coveragePercentage >= 80) return 'bg-green-50';
    if (coverage.coveragePercentage >= 70) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const getCoverageBadgeColor = (coverage?: CoverageDay) => {
    if (!coverage) return 'bg-gray-100 text-gray-800';
    if (coverage.coveragePercentage >= 80) return 'bg-green-100 text-green-800';
    if (coverage.coveragePercentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

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
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <Label>Departman</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Departmanlar</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((dayName) => (
              <div key={dayName} className="p-2 text-center font-medium text-gray-600 text-sm">
                {dayName.slice(0, 3)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.flat().map((day, index) => (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border border-gray-200 rounded-lg
                  ${day.isCurrentMonth ? getCoverageColor(day.coverage) : 'bg-gray-50'}
                  ${!day.isCurrentMonth && 'opacity-50'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${!day.isCurrentMonth && 'text-gray-400'}`}>
                    {day.date.getDate()}
                  </span>
                  {day.coverage && (
                    <Badge className={`text-xs ${getCoverageBadgeColor(day.coverage)}`}>
                      {day.coverage.coveragePercentage}%
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1">
                  {day.leaves.slice(0, 3).map((leave, leaveIndex) => (
                    <div
                      key={leaveIndex}
                      className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                      title={`${leave.personnelName} - ${leave.leaveType}`}
                    >
                      {leave.personnelName.split(' ').map(n => n[0]).join('.')}
                    </div>
                  ))}
                  {day.leaves.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{day.leaves.length - 3} daha
                    </div>
                  )}
                </div>
                
                {day.coverage && !day.coverage.isAdequate && (
                  <div className="mt-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 text-red-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Summary for Selected Department */}
      {selectedDepartment !== 'all' && coverageData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Departman Kapsama Analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {coverageData.filter(day => day.coveragePercentage >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Yüksek Kapsama (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {coverageData.filter(day => day.coveragePercentage >= 70 && day.coveragePercentage < 80).length}
                </div>
                <div className="text-sm text-gray-600">Orta Kapsama (70-79%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {coverageData.filter(day => day.coveragePercentage < 70).length}
                </div>
                <div className="text-sm text-gray-600">Düşük Kapsama (&lt;70%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(coverageData.reduce((sum, day) => sum + day.coveragePercentage, 0) / coverageData.length)}%
                </div>
                <div className="text-sm text-gray-600">Ortalama Kapsama</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Kritik Günler (Kapsama &lt; 70%)</h4>
              {coverageData
                .filter(day => day.coveragePercentage < 70)
                .slice(0, 5)
                .map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium">{new Date(day.date).toLocaleDateString('tr-TR')}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        İzinli: {day.onLeave}/{day.totalStaff} • Müsait: {day.available}
                      </span>
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                      {day.coveragePercentage}%
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Açıklamalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
              <span className="text-sm">Yüksek Kapsama (≥80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-sm">Orta Kapsama (70-79%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-sm">Düşük Kapsama (&lt;70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm">Personel yetersizliği uyarısı</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}