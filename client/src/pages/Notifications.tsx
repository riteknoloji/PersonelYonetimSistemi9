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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Smartphone,
  FileText,
  Filter
} from 'lucide-react';
import type { Notification, NotificationWithRelations, Employee } from '@shared/schema';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  content: string;
  type: string;
  variables: string[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationWithRelations[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('list');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Create single notification form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'normal' as const,
    recipientId: '',
    scheduledFor: '',
    smsEnabled: false,
    pushEnabled: true,
    emailEnabled: false,
  });

  // Bulk notification form
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [bulkNotification, setBulkNotification] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'normal' as const,
    recipientIds: [] as string[],
    templateId: '',
    templateVariables: {} as Record<string, string>,
  });

  useEffect(() => {
    loadNotifications();
    loadTemplates();
    loadEmployees();
  }, [statusFilter, typeFilter]);

  const loadNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/notifications?${params.toString()}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setMessage('Bildirimler yüklenirken hata oluştu');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/notifications/templates', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/personnel', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.content || !newNotification.recipientId) {
      setMessage('Başlık, içerik ve alıcı bilgileri zorunludur');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newNotification),
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications([data, ...notifications]);
        setNewNotification({
          title: '',
          content: '',
          type: 'info',
          priority: 'normal',
          recipientId: '',
          scheduledFor: '',
          smsEnabled: false,
          pushEnabled: true,
          emailEnabled: false,
        });
        setShowCreateForm(false);
        setMessage('Bildirim başarıyla oluşturuldu');
      } else {
        const error = await response.json();
        setMessage(error.message || 'Bildirim oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      setMessage('Bildirim oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const sendBulkNotifications = async () => {
    if (!bulkNotification.title || !bulkNotification.content || bulkNotification.recipientIds.length === 0) {
      setMessage('Başlık, içerik ve en az bir alıcı seçimi zorunludur');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/notifications/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          recipientIds: bulkNotification.recipientIds,
          title: bulkNotification.title,
          content: bulkNotification.content,
          type: bulkNotification.type,
          priority: bulkNotification.priority,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setBulkNotification({
          title: '',
          content: '',
          type: 'info',
          priority: 'normal',
          recipientIds: [],
          templateId: '',
          templateVariables: {},
        });
        setShowBulkForm(false);
        loadNotifications(); // Refresh list
      } else {
        const error = await response.json();
        setMessage(error.message || 'Toplu bildirim gönderilemedi');
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      setMessage('Toplu bildirim gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const updatedNotification = await response.json();
        setNotifications(notifications.map(n => 
          n.id === notificationId ? updatedNotification : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const sendNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/send`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        loadNotifications(); // Refresh to show updated status
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setBulkNotification({
      ...bulkNotification,
      templateId: template.id,
      title: template.title,
      content: template.content,
      type: template.type as any,
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-green-100 text-green-800',
      read: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      celebration: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'normal': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const toggleRecipientSelection = (employeeId: string) => {
    const currentSelection = bulkNotification.recipientIds;
    if (currentSelection.includes(employeeId)) {
      setBulkNotification({
        ...bulkNotification,
        recipientIds: currentSelection.filter(id => id !== employeeId)
      });
    } else {
      setBulkNotification({
        ...bulkNotification,
        recipientIds: [...currentSelection, employeeId]
      });
    }
  };

  const selectAllEmployees = () => {
    setBulkNotification({
      ...bulkNotification,
      recipientIds: employees.map(emp => emp.id)
    });
  };

  const clearSelection = () => {
    setBulkNotification({
      ...bulkNotification,
      recipientIds: []
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Bildirim Sistemi</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tekli Bildirim
          </Button>
          <Button onClick={() => setShowBulkForm(true)} variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Toplu Bildirim
          </Button>
        </div>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Bildirimler</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
          <TabsTrigger value="analytics">İstatistikler</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtreler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Durum</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="sent">Gönderildi</SelectItem>
                      <SelectItem value="read">Okundu</SelectItem>
                      <SelectItem value="failed">Başarısız</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Tür</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="info">Bilgi</SelectItem>
                      <SelectItem value="success">Başarılı</SelectItem>
                      <SelectItem value="warning">Uyarı</SelectItem>
                      <SelectItem value="error">Hata</SelectItem>
                      <SelectItem value="celebration">Kutlama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityIcon(notification.priority)}
                        <h3 className="font-semibold">{notification.title}</h3>
                        <Badge className={getStatusColor(notification.status)}>
                          {notification.status === 'draft' && 'Taslak'}
                          {notification.status === 'sent' && 'Gönderildi'}
                          {notification.status === 'read' && 'Okundu'}
                          {notification.status === 'failed' && 'Başarısız'}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(notification.type)}>
                          {notification.type === 'info' && 'Bilgi'}
                          {notification.type === 'success' && 'Başarılı'}
                          {notification.type === 'warning' && 'Uyarı'}
                          {notification.type === 'error' && 'Hata'}
                          {notification.type === 'celebration' && 'Kutlama'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{notification.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Alıcı: {notification.recipientId}</span>
                        <span>
                          Oluşturulma: {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </span>
                        {notification.sentAt && (
                          <span>
                            Gönderilme: {new Date(notification.sentAt).toLocaleString('tr-TR')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {notification.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => sendNotification(notification.id)}
                          className="flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Gönder
                        </Button>
                      )}
                      {notification.status === 'sent' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Okundu İşaretle
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {notifications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz bildirim bulunmuyor</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline" className={getTypeColor(template.type)}>
                          {template.type === 'info' && 'Bilgi'}
                          {template.type === 'success' && 'Başarılı'}
                          {template.type === 'warning' && 'Uyarı'}
                          {template.type === 'error' && 'Hata'}
                          {template.type === 'celebration' && 'Kutlama'}
                        </Badge>
                      </div>
                      
                      <p className="font-medium text-gray-800 mb-2">{template.title}</p>
                      <p className="text-gray-700 mb-3">{template.content}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Değişkenler:</span>
                        {template.variables.map(variable => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => useTemplate(template)}
                      className="ml-4"
                    >
                      Kullan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Toplam Bildirim</p>
                    <p className="text-2xl font-bold">{notifications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Send className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Gönderildi</p>
                    <p className="text-2xl font-bold">
                      {notifications.filter(n => n.status === 'sent').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Okundu</p>
                    <p className="text-2xl font-bold">
                      {notifications.filter(n => n.status === 'read').length}
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
                    <p className="text-sm text-gray-600">Başarısız</p>
                    <p className="text-2xl font-bold">
                      {notifications.filter(n => n.status === 'failed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Single Notification Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Bildirim Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Bildirim başlığı"
              />
            </div>

            <div>
              <Label htmlFor="content">İçerik *</Label>
              <Textarea
                id="content"
                value={newNotification.content}
                onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
                placeholder="Bildirim içeriği"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tür</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value: any) => setNewNotification({ ...newNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Bilgi</SelectItem>
                    <SelectItem value="success">Başarılı</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                    <SelectItem value="celebration">Kutlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Öncelik</Label>
                <Select
                  value={newNotification.priority}
                  onValueChange={(value: any) => setNewNotification({ ...newNotification, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="recipient">Alıcı *</Label>
              <Select
                value={newNotification.recipientId}
                onValueChange={(value) => setNewNotification({ ...newNotification, recipientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Personel seçin" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createNotification} 
                disabled={loading || !newNotification.title || !newNotification.content || !newNotification.recipientId}
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

      {/* Bulk Notification Dialog */}
      <Dialog open={showBulkForm} onOpenChange={setShowBulkForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Toplu Bildirim Gönder</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-title">Başlık *</Label>
                <Input
                  id="bulk-title"
                  value={bulkNotification.title}
                  onChange={(e) => setBulkNotification({ ...bulkNotification, title: e.target.value })}
                  placeholder="Bildirim başlığı"
                />
              </div>
              <div>
                <Label htmlFor="template">Şablon Kullan</Label>
                <Select
                  value={bulkNotification.templateId}
                  onValueChange={(templateId) => {
                    const template = templates.find(t => t.id === templateId);
                    if (template) useTemplate(template);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Şablon seç (isteğe bağlı)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="bulk-content">İçerik *</Label>
              <Textarea
                id="bulk-content"
                value={bulkNotification.content}
                onChange={(e) => setBulkNotification({ ...bulkNotification, content: e.target.value })}
                placeholder="Bildirim içeriği"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bulk-type">Tür</Label>
                <Select
                  value={bulkNotification.type}
                  onValueChange={(value: any) => setBulkNotification({ ...bulkNotification, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Bilgi</SelectItem>
                    <SelectItem value="success">Başarılı</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                    <SelectItem value="error">Hata</SelectItem>
                    <SelectItem value="celebration">Kutlama</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bulk-priority">Öncelik</Label>
                <Select
                  value={bulkNotification.priority}
                  onValueChange={(value: any) => setBulkNotification({ ...bulkNotification, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Alıcılar * ({bulkNotification.recipientIds.length} seçildi)</Label>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAllEmployees}>
                    Tümünü Seç
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Temizle
                  </Button>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-2">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`employee-${employee.id}`}
                      checked={bulkNotification.recipientIds.includes(employee.id)}
                      onChange={() => toggleRecipientSelection(employee.id)}
                    />
                    <Label htmlFor={`employee-${employee.id}`} className="text-sm">
                      {employee.firstName} {employee.lastName} - {employee.position}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={sendBulkNotifications} 
                disabled={loading || !bulkNotification.title || !bulkNotification.content || bulkNotification.recipientIds.length === 0}
                className="flex-1"
              >
                {loading ? 'Gönderiliyor...' : `${bulkNotification.recipientIds.length} Kişiye Gönder`}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBulkForm(false)}
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