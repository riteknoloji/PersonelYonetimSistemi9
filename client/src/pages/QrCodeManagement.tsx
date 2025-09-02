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
import { QrCode, RefreshCw, Plus, Trash2, Eye } from 'lucide-react';
import type { QrCode as QrCodeType, Branch } from '@shared/schema';

interface QrCodeWithImage extends QrCodeType {
  qrImage?: string;
}

export default function QrCodeManagement() {
  const [qrCodes, setQrCodes] = useState<QrCodeWithImage[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<QrCodeWithImage | null>(null);
  const [regeneratePin, setRegeneratePin] = useState('');

  const [newQrCode, setNewQrCode] = useState({
    branchId: '',
    location: '',
    description: '',
    pinCode: '',
    requirePin: false,
  });

  useEffect(() => {
    loadQrCodes();
    loadBranches();
  }, []);

  const loadQrCodes = async () => {
    try {
      const response = await fetch('/api/qr-codes', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setQrCodes(data);
      }
    } catch (error) {
      console.error('Error loading QR codes:', error);
      setMessage('QR kodları yüklenirken hata oluştu');
    }
  };

  const loadBranches = async () => {
    try {
      const response = await fetch('/api/branches', {
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const createQrCode = async () => {
    if (!newQrCode.branchId || !newQrCode.location) {
      setMessage('Şube ve konum bilgileri zorunludur');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...newQrCode,
          pinCode: newQrCode.requirePin ? newQrCode.pinCode : null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodes([...qrCodes, data]);
        setNewQrCode({
          branchId: '',
          location: '',
          description: '',
          pinCode: '',
          requirePin: false,
        });
        setShowCreateForm(false);
        setMessage('QR kod başarıyla oluşturuldu');
      } else {
        const error = await response.json();
        setMessage(error.message || 'QR kod oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating QR code:', error);
      setMessage('QR kod oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const regenerateQrCode = async (qrCodeId: string, pinCode?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ pinCode }),
      });

      if (response.ok) {
        const data = await response.json();
        setQrCodes(qrCodes.map(qr => qr.id === qrCodeId ? data : qr));
        setMessage(data.message || 'QR kod yenilendi');
        setRegeneratePin('');
        setSelectedQrCode(null);
      } else {
        const error = await response.json();
        setMessage(error.message || 'QR kod yenilenemedi');
      }
    } catch (error) {
      console.error('Error regenerating QR code:', error);
      setMessage('QR kod yenilenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deleteQrCode = async (qrCodeId: string) => {
    if (!confirm('Bu QR kodu deaktif etmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/qr-codes/${qrCodeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQrCodes(qrCodes.filter(qr => qr.id !== qrCodeId));
        setMessage('QR kod deaktif edildi');
      } else {
        setMessage('QR kod silinemedi');
      }
    } catch (error) {
      console.error('Error deleting QR code:', error);
      setMessage('QR kod silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Bilinmeyen Şube';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <QrCode className="h-8 w-8" />
          <h1 className="text-3xl font-bold">QR Kod Yönetimi</h1>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni QR Kod
        </Button>
      </div>

      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qrCode) => (
          <Card key={qrCode.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getBranchName(qrCode.branchId || '')}</CardTitle>
                <Badge variant={qrCode.isActive ? 'default' : 'secondary'}>
                  {qrCode.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{qrCode.location || 'Konum belirtilmemiş'}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code Image */}
              {qrCode.qrImage && (
                <div className="flex justify-center">
                  <img 
                    src={qrCode.qrImage} 
                    alt="QR Code" 
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                </div>
              )}

              {/* Code Info */}
              <div className="space-y-2 text-sm">
                <div>
                  <Label className="font-medium">Kod:</Label>
                  <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                    {qrCode.codeValue}
                  </p>
                </div>
                {qrCode.description && (
                  <div>
                    <Label className="font-medium">Açıklama:</Label>
                    <p>{qrCode.description}</p>
                  </div>
                )}
                <div>
                  <Label className="font-medium">Oluşturulma:</Label>
                  <p>{qrCode.createdAt ? new Date(qrCode.createdAt).toLocaleString('tr-TR') : 'Bilinmeyen'}</p>
                </div>
                {qrCode.pinCode !== null && qrCode.pinCode !== undefined && (
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">PIN Korumalı</Label>
                    <Badge variant="outline">🔒</Badge>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedQrCode(qrCode)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Görüntüle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>QR Kod Detayı</DialogTitle>
                    </DialogHeader>
                    {selectedQrCode && (
                      <div className="space-y-4">
                        {selectedQrCode.qrImage && (
                          <div className="flex justify-center">
                            <img 
                              src={selectedQrCode.qrImage} 
                              alt="QR Code" 
                              className="w-64 h-64 border border-gray-200 rounded-lg"
                            />
                          </div>
                        )}
                        <div className="space-y-2 text-sm">
                          <div>
                            <Label className="font-medium">Şube:</Label>
                            <p>{getBranchName(selectedQrCode.branchId || '')}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Konum:</Label>
                            <p>{selectedQrCode.location || 'Konum belirtilmemiş'}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Kod:</Label>
                            <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
                              {selectedQrCode.codeValue}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedQrCode(qrCode)}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Yenile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>QR Kod Yenile</DialogTitle>
                    </DialogHeader>
                    {selectedQrCode && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Bu işlem mevcut QR kodunu geçersiz kılar ve yeni bir kod üretir.
                        </p>
                        {selectedQrCode.pinCode !== null && selectedQrCode.pinCode !== undefined && (
                          <div>
                            <Label htmlFor="regenerate-pin">PIN Kodu</Label>
                            <Input
                              id="regenerate-pin"
                              type="password"
                              value={regeneratePin}
                              onChange={(e) => setRegeneratePin(e.target.value)}
                              placeholder="PIN kodunu girin"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => regenerateQrCode(selectedQrCode.id, regeneratePin)}
                            disabled={loading || (selectedQrCode.pinCode !== null && selectedQrCode.pinCode !== undefined && !regeneratePin)}
                            className="flex-1"
                          >
                            {loading ? 'Yenileniyor...' : 'Yenile'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => deleteQrCode(qrCode.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" />
                  Sil
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Henüz QR kod bulunmuyor</h3>
          <p className="text-gray-400 mb-4">QR kod oluşturarak personel giriş-çıkış takibini başlatabilirsiniz</p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            İlk QR Kodunu Oluştur
          </Button>
        </div>
      )}

      {/* Create QR Code Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni QR Kod Oluştur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="branch">Şube *</Label>
              <Select
                value={newQrCode.branchId}
                onValueChange={(value) => setNewQrCode({ ...newQrCode, branchId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şube seçin" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Konum *</Label>
              <Input
                id="location"
                value={newQrCode.location}
                onChange={(e) => setNewQrCode({ ...newQrCode, location: e.target.value })}
                placeholder="Örn: Ana Giriş, Personel Kapısı"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={newQrCode.description}
                onChange={(e) => setNewQrCode({ ...newQrCode, description: e.target.value })}
                placeholder="QR kod hakkında açıklama"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="require-pin"
                checked={newQrCode.requirePin}
                onChange={(e) => setNewQrCode({ ...newQrCode, requirePin: e.target.checked })}
              />
              <Label htmlFor="require-pin">PIN kod ile koruma</Label>
            </div>

            {newQrCode.requirePin && (
              <div>
                <Label htmlFor="pin-code">PIN Kodu</Label>
                <Input
                  id="pin-code"
                  type="password"
                  value={newQrCode.pinCode}
                  onChange={(e) => setNewQrCode({ ...newQrCode, pinCode: e.target.value })}
                  placeholder="4-6 haneli PIN"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createQrCode} 
                disabled={loading || !newQrCode.branchId || !newQrCode.location}
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