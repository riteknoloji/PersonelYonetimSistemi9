import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info,
  Plus
} from 'lucide-react';

interface ShiftCalendarEvent {
  id: string;
  date: string;
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    color: string;
  };
  personnel: {
    id: string;
    name: string;
    position: string;
  };
}

interface CoverageAnalysis {
  date: string;
  shifts: {
    shift: {
      id: string;
      name: string;
      startTime: string;
      endTime: string;
      color: string;
    };
    assignedPersonnel: any[];
    assignedCount: number;
    requiredCount: number;
    coveragePercentage: number;
    isAdequate: boolean;
  }[];
  summary: {
    totalRequired: number;
    totalAssigned: number;
    overallCoveragePercentage: number;
    adequateShifts: number;
    inadequateShifts: number;
  };
}

export function ShiftCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<ShiftCalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [coverageData, setCoverageData] = useState<CoverageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'coverage'>('calendar');

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  useEffect(() => {
    if (selectedDate) {
      loadCoverageData();
    }
  }, [selectedDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        .toISOString().split('T')[0];
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
        .toISOString().split('T')[0];

      const response = await fetch(`/api/shift-calendar?startDate=${startDate}&endDate=${endDate}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.assignments);
      } else {
        setMessage('Vardiya takvimi verileri alınamadı');
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setMessage('Vardiya takvimi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadCoverageData = async () => {
    if (!selectedDate) return;
    
    try {
      const response = await fetch(`/api/shift-coverage/${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setCoverageData(data);
      } else {
        setMessage('Kapsama analizi verileri alınamadı');
      }
    } catch (error) {
      console.error('Error loading coverage data:', error);
      setMessage('Kapsama analizi yüklenirken hata oluştu');
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
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        
        // Get events for this date
        const dayEvents = calendarEvents.filter(event => event.date === dateStr);
        
        // Group events by shift
        const shiftGroups = {};
        dayEvents.forEach(event => {
          const shiftId = event.shift.id;
          if (!shiftGroups[shiftId]) {
            shiftGroups[shiftId] = {
              shift: event.shift,
              personnel: []
            };
          }
          shiftGroups[shiftId].personnel.push(event.personnel);
        });
        
        weekDays.push({
          date: currentDate,
          dateStr,
          isCurrentMonth,
          isToday,
          events: dayEvents,
          shiftGroups: Object.values(shiftGroups)
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

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setViewMode('coverage');
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

      {/* Header Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
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
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Takvim
                </Button>
                <Button
                  variant={viewMode === 'coverage' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('coverage')}
                  disabled={!selectedDate}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Kapsama
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
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
                    min-h-[140px] p-2 border border-gray-200 rounded-lg cursor-pointer
                    hover:bg-gray-50 transition-colors
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 opacity-60'}
                    ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                    ${selectedDate === day.dateStr ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                  `}
                  onClick={() => handleDateClick(day.dateStr)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      day.isToday ? 'text-blue-600' : 
                      !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </span>
                    {day.events.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {day.events.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {day.shiftGroups.slice(0, 3).map((group: any, groupIndex: number) => (
                      <div
                        key={groupIndex}
                        className="text-xs p-1 rounded text-white text-center"
                        style={{ backgroundColor: group.shift.color }}
                        title={`${group.shift.name} (${group.shift.startTime}-${group.shift.endTime}): ${group.personnel.map((p: any) => p.name).join(', ')}`}
                      >
                        <div className="font-medium truncate">
                          {group.shift.name}
                        </div>
                        <div className="text-xs opacity-90">
                          {group.personnel.length} personel
                        </div>
                      </div>
                    ))}
                    
                    {day.shiftGroups.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.shiftGroups.length - 3} vardiya
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coverage Analysis View */}
      {viewMode === 'coverage' && selectedDate && coverageData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Vardiya Kapsama Analizi - {new Date(selectedDate).toLocaleDateString('tr-TR')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {coverageData.summary.overallCoveragePercentage}%
                </div>
                <div className="text-sm text-gray-600">Genel Kapsama</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {coverageData.summary.adequateShifts}
                </div>
                <div className="text-sm text-gray-600">Yeterli Vardiya</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {coverageData.summary.inadequateShifts}
                </div>
                <div className="text-sm text-gray-600">Yetersiz Vardiya</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {coverageData.summary.totalAssigned}/{coverageData.summary.totalRequired}
                </div>
                <div className="text-sm text-gray-600">Atanan/Gerekli</div>
              </div>
            </div>

            {/* Detailed Shift Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium">Vardiya Detayları</h4>
              {coverageData.shifts.map((shiftCoverage, index) => (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 ${
                    shiftCoverage.isAdequate ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: shiftCoverage.shift.color }}
                      ></div>
                      <div>
                        <h5 className="font-medium">{shiftCoverage.shift.name}</h5>
                        <p className="text-sm text-gray-600">
                          {shiftCoverage.shift.startTime} - {shiftCoverage.shift.endTime}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={`${
                          shiftCoverage.isAdequate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shiftCoverage.coveragePercentage}%
                      </Badge>
                      {!shiftCoverage.isAdequate && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-gray-600">Atanan Personel: </span>
                      <span className="font-medium">{shiftCoverage.assignedCount}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Gereken Personel: </span>
                      <span className="font-medium">{shiftCoverage.requiredCount}</span>
                    </div>
                  </div>
                  
                  {shiftCoverage.assignedPersonnel.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Atanan Personeller:</p>
                      <div className="flex flex-wrap gap-2">
                        {shiftCoverage.assignedPersonnel.map((person, personIndex) => (
                          <Badge key={personIndex} variant="outline">
                            {person.name} - {person.position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {shiftCoverage.assignedCount === 0 && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Bu vardiyaya henüz kimse atanmamış</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setViewMode('calendar')}>
                <Calendar className="h-4 w-4 mr-2" />
                Takvime Dön
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Vardiya Atama Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Vardiya Renk Kodları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3B82F6' }}></div>
              <span className="text-sm">Sabah Vardiyası</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
              <span className="text-sm">Öğleden Sonra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6366F1' }}></div>
              <span className="text-sm">Gece Vardiyası</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
              <span className="text-sm">Yarı Zamanlı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F97316' }}></div>
              <span className="text-sm">Özel Vardiya</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8B5CF6' }}></div>
              <span className="text-sm">Hafta Sonu</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}