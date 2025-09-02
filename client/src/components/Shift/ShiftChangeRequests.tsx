import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw,
  Clock,
  User,
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ShiftChangeRequest {
  id: string;
  originalAssignmentId: string;
  requestedShiftId: string;
  requestedDate: string;
  reason: string;
  requesterId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export function ShiftChangeRequests() {
  const [requests, setRequests] = useState<ShiftChangeRequest[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    originalAssignmentId: '',
    requestedShiftId: '',
    requestedDate: '',
    reason: ''
  });

  useEffect(() => {
    loadChangeRequests();
    loadPersonnel();
    loadShifts();
    loadAssignments();
  }, []);

  const loadChangeRequests = async () => {
    try {
      const response = await fetch('/api/shift-change-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading change requests:', error);
    }
  };

  const loadPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      if (response.ok) {
        const data = await response.json();
        setPersonnel(data);
      }
    } catch (error) {
      console.error('Error loading personnel:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const response = await fetch('/api/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Error loading shifts:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/shift-assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const createChangeRequest = async () => {
    if (!newRequest.originalAssignmentId || !newRequest.requestedShiftId || !newRequest.reason) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/shift-change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Başarılı",
          description: "Vardiya değişiklik talebi oluşturuldu",
        });
        setNewRequestModalOpen(false);
        setNewRequest({
          originalAssignmentId: '',
          requestedShiftId: '',
          requestedDate: '',
          reason: ''
        });
        loadChangeRequests();
      } else {
        toast({
          title: "Hata",
          description: "Talep oluşturulurken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating change request:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    // In a real implementation, this would update the request status
    toast({
      title: "Onaylandı",
      description: "Vardiya değişiklik talebi onaylandı",
    });
  };

  const rejectRequest = async (requestId: string) => {
    const reason = window.prompt("Red nedeni giriniz:");
    if (reason !== null) {
      // In a real implementation, this would update the request status
      toast({
        title: "Reddedildi",
        description: "Vardiya değişiklik talebi reddedildi",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Beklemede</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Onaylandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = true; // In a real implementation, you'd search by personnel name, etc.
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mock data for demonstration since we don't have a proper database table yet
  const mockRequests = [
    {
      id: '1',
      originalAssignmentId: 'assign-1',
      requestedShiftId: 'shift-2',
      requestedDate: '2025-02-15',
      reason: 'Kişisel nedenler',
      requesterId: 'user-1',
      status: 'pending' as const,
      createdAt: '2025-01-20T10:30:00Z',
    },
    {
      id: '2',
      originalAssignmentId: 'assign-2',
      requestedShiftId: 'shift-1',
      requestedDate: '2025-02-16',
      reason: 'Sağlık kontrolü',
      requesterId: 'user-2',
      status: 'approved' as const,
      createdAt: '2025-01-19T14:15:00Z',
      approvedBy: 'admin-1',
      approvedAt: '2025-01-19T16:30:00Z'
    }
  ];

  const displayRequests = requests.length > 0 ? filteredRequests : mockRequests;

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Vardiya Değişim Talepleri
            </CardTitle>
            <Button onClick={() => setNewRequestModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Talep
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Personel ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Bekleyen Talepler</p>
                <p className="text-2xl font-bold">
                  {displayRequests.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Onaylandı</p>
                <p className="text-2xl font-bold">
                  {displayRequests.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Reddedildi</p>
                <p className="text-2xl font-bold">
                  {displayRequests.filter(r => r.status === 'rejected').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam Talep</p>
                <p className="text-2xl font-bold">{displayRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Talep Eden</TableHead>
                <TableHead>Mevcut Vardiya</TableHead>
                <TableHead>İstenen Vardiya</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Neden</TableHead>
                <TableHead>Oluşturma</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Henüz vardiya değişim talebi bulunmuyor.
                  </TableCell>
                </TableRow>
              ) : (
                displayRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>Personel #{request.requesterId.slice(-3)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>Sabah Vardiyası</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span>Öğleden Sonra Vardiyası</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(request.requestedDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-32" title={request.reason}>
                          {request.reason}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => approveRequest(request.id)}
                          >
                            Onayla
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => rejectRequest(request.id)}
                          >
                            Reddet
                          </Button>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <span className="text-sm text-green-600">Onaylandı</span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="text-sm text-red-600">Reddedildi</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Modal */}
      <Dialog open={newRequestModalOpen} onOpenChange={setNewRequestModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Vardiya Değişim Talebi</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Mevcut Vardiya Ataması</Label>
              <Select 
                value={newRequest.originalAssignmentId} 
                onValueChange={(value) => setNewRequest({...newRequest, originalAssignmentId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Atama seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign-1">15 Şubat 2025 - Sabah Vardiyası</SelectItem>
                  <SelectItem value="assign-2">16 Şubat 2025 - Öğleden Sonra Vardiyası</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>İstenen Vardiya</Label>
              <Select 
                value={newRequest.requestedShiftId} 
                onValueChange={(value) => setNewRequest({...newRequest, requestedShiftId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vardiya seçin" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime}-{shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>İstenen Tarih (isteğe bağlı)</Label>
              <Input 
                type="date" 
                value={newRequest.requestedDate}
                onChange={(e) => setNewRequest({...newRequest, requestedDate: e.target.value})}
              />
            </div>

            <div>
              <Label>Değişiklik Nedeni</Label>
              <Textarea 
                placeholder="Vardiya değişikliği nedeninizi açıklayın..."
                value={newRequest.reason}
                onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setNewRequestModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={createChangeRequest} disabled={loading}>
              {loading ? 'Talep Oluşturuluyor...' : 'Talep Oluştur'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}