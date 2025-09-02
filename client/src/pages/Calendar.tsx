import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, MapPin, Clock, Users, Star, Download } from 'lucide-react';
import type { CalendarEvent, CalendarEventWithRelations, Holiday } from '@shared/schema';

interface CalendarEventWithImage extends CalendarEventWithRelations {
  attendeesCount?: number;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventWithImage[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    type: 'meeting' as const,
    location: '',
    isRecurring: false,
    recurrencePattern: '',
    color: '#3B82F6',
    isPublic: true,
    reminderMinutes: 15,
    attendees: [] as string[],
  });

  useEffect(() => {
    loadEvents();
    loadHolidays();
  }, [selectedDate, viewMode]);

  const loadEvents = async () => {
    try {
      const startDate = getViewStartDate();
      const endDate = getViewEndDate();
      
      const response = await fetch(`/api/calendar/events?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setMessage('Etkinlikler yüklenirken hata oluştu');
    }
  };

  const loadHolidays = async () => {
    try {
      const currentYear = new Date(selectedDate).getFullYear().toString();
      const response = await fetch(`/api/calendar/holidays?year=${currentYear}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setHolidays(data);
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.eventDate) {
      setMessage('Başlık ve tarih bilgileri zorunludur');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...newEvent,
          attendees: JSON.stringify(newEvent.attendees),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEvents([...events, data]);
        setNewEvent({
          title: '',
          description: '',
          eventDate: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          type: 'meeting' as const,
          location: '',
          isRecurring: false,
          recurrencePattern: '',
          color: '#3B82F6',
          isPublic: true,
          reminderMinutes: 15,
          attendees: [],
        });
        setShowCreateForm(false);
        setMessage('Etkinlik başarıyla oluşturuldu');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Etkinlik oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage('Etkinlik oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const populateTurkishHolidays = async () => {
    const currentYear = new Date(selectedDate).getFullYear().toString();
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/holidays/populate-turkish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ year: currentYear }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        loadHolidays(); // Refresh holidays list
      } else {
        const error = await response.json();
        setMessage(error.message || 'Tatiller eklenemedi');
      }
    } catch (error) {
      console.error('Error populating holidays:', error);
      setMessage('Tatiller eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getViewStartDate = () => {
    const date = new Date(selectedDate);
    switch (viewMode) {
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return startOfWeek.toISOString().split('T')[0];
      case 'day':
        return selectedDate;
      default: // month
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        return startOfMonth.toISOString().split('T')[0];
    }
  };

  const getViewEndDate = () => {
    const date = new Date(selectedDate);
    switch (viewMode) {
      case 'week':
        const endOfWeek = new Date(date);
        endOfWeek.setDate(date.getDate() - date.getDay() + 6);
        return endOfWeek.toISOString().split('T')[0];
      case 'day':
        return selectedDate;
      default: // month
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return endOfMonth.toISOString().split('T')[0];
    }
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-800',
      training: 'bg-green-100 text-green-800',
      holiday: 'bg-red-100 text-red-800',
      deadline: 'bg-orange-100 text-orange-800',
      celebration: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return time.slice(0, 5); // Show only HH:MM
  };

  const isHoliday = (date: string) => {
    return holidays.some(holiday => holiday.date === date);
  };

  const getHolidayForDate = (date: string) => {
    return holidays.find(holiday => holiday.date === date);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Takvim</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Ay
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Hafta
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('day')}
            >
              Gün
            </Button>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Etkinlik
          </Button>
        </div>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>
                  {viewMode === 'month' && new Date(selectedDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                  {viewMode === 'week' && `${getViewStartDate()} - ${getViewEndDate()}`}
                  {viewMode === 'day' && new Date(selectedDate).toLocaleDateString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={populateTurkishHolidays}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-3 w-3" />
                  {loading ? 'Ekleniyor...' : 'TR Tatilleri Ekle'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: event.color || '#3B82F6', borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type === 'meeting' && 'Toplantı'}
                            {event.type === 'training' && 'Eğitim'}
                            {event.type === 'holiday' && 'Tatil'}
                            {event.type === 'deadline' && 'Son Tarih'}
                            {event.type === 'celebration' && 'Kutlama'}
                            {event.type === 'other' && 'Diğer'}
                          </Badge>
                          {!event.isPublic && (
                            <Badge variant="outline">Özel</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(event.eventDate).toLocaleDateString('tr-TR')} 
                              {event.startTime && event.endTime && 
                                ` • ${formatTime(event.startTime)} - ${formatTime(event.endTime)}`
                              }
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          
                          {event.attendees && (
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              <span>{JSON.parse(event.attendees as string || '[]').length} katılımcı</span>
                            </div>
                          )}
                          
                          {event.isRecurring && (
                            <div className="flex items-center gap-2">
                              <Star className="h-3 w-3" />
                              <span>Tekrarlanan etkinlik</span>
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="mt-2 text-sm text-gray-700">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Bu tarih aralığında etkinlik bulunmuyor
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Holidays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tatiller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {holidays.slice(0, 5).map((holiday) => (
                  <div key={holiday.id} className="border-l-4 border-red-400 pl-3">
                    <p className="font-medium text-sm">{holiday.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(holiday.date).toLocaleDateString('tr-TR')}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {holiday.type === 'public' ? 'Resmi' : 'Dini'} Tatil
                    </Badge>
                  </div>
                ))}
                {holidays.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Henüz tatil eklenmemiş
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Özet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bu Ay Etkinlik</span>
                  <Badge variant="secondary">{events.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Yaklaşan Tatiller</span>
                  <Badge variant="secondary">
                    {holidays.filter(h => new Date(h.date) > new Date()).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Tatil</span>
                  <Badge variant="secondary">{holidays.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Etkinlik Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Etkinlik başlığı"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-date">Tarih *</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.eventDate}
                  onChange={(e) => setNewEvent({ ...newEvent, eventDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="event-type">Tür</Label>
                <Select
                  value={newEvent.type}
                  onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Etkinlik türü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Toplantı</SelectItem>
                    <SelectItem value="training">Eğitim</SelectItem>
                    <SelectItem value="holiday">Tatil</SelectItem>
                    <SelectItem value="deadline">Son Tarih</SelectItem>
                    <SelectItem value="celebration">Kutlama</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Başlangıç Saati</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Bitiş Saati</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Konum</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Toplantı salonu, adres vb."
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Etkinlik detayları"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={newEvent.isPublic}
                  onChange={(e) => setNewEvent({ ...newEvent, isPublic: e.target.checked })}
                />
                <Label htmlFor="is-public">Herkese açık</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is-recurring"
                  checked={newEvent.isRecurring}
                  onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                />
                <Label htmlFor="is-recurring">Tekrarlanan</Label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createEvent} 
                disabled={loading || !newEvent.title || !newEvent.eventDate}
                className="flex-1"
              >
                {loading ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                İptal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}