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
  Clock,
  Users,
  Download,
  Upload,
  Plus,
  Copy,
  Settings,
  Info,
  CheckCircle
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ShiftTemplate {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  workingHours: string;
  color: string;
  isDefault: boolean;
}

interface BulkAssignmentData {
  templateId: string;
  startDate: string;
  endDate: string;
  selectedPersonnel: string[];
  selectedDays: number[]; // 0=Sunday, 1=Monday, etc.
}

export function ShiftTemplates() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkData, setBulkData] = useState<BulkAssignmentData>({
    templateId: '',
    startDate: '',
    endDate: '',
    selectedPersonnel: [],
    selectedDays: [1, 2, 3, 4, 5] // Default: weekdays
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
    loadPersonnel();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/shift-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      } else {
        setMessage('Vardiya şablonları yüklenemedi');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setMessage('Şablonlar yüklenirken hata oluştu');
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

  const createShiftFromTemplate = async (template: ShiftTemplate) => {
    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          startTime: template.startTime,
          endTime: template.endTime,
          workingHours: template.workingHours,
          isActive: true
        })
      });

      if (response.ok) {
        toast({
          title: "Başarılı",
          description: `${template.name} şablonundan vardiya oluşturuldu`,
        });
      } else {
        toast({
          title: "Hata",
          description: "Vardiya oluşturulurken hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating shift from template:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleBulkAssignment = async () => {
    if (!bulkData.templateId || !bulkData.startDate || !bulkData.endDate || bulkData.selectedPersonnel.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate assignments for selected date range and personnel
      const assignments = [];
      const start = new Date(bulkData.startDate);
      const end = new Date(bulkData.endDate);
      
      // Find the shift ID that corresponds to this template
      // For now, we'll use a placeholder - in a real system, you'd create the shift first
      const shiftId = 'template-shift-' + bulkData.templateId;

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        
        // Only assign on selected days of the week
        if (bulkData.selectedDays.includes(dayOfWeek)) {
          for (const personnelId of bulkData.selectedPersonnel) {
            assignments.push({
              personnelId,
              shiftId,
              date: date.toISOString().split('T')[0]
            });
          }
        }
      }

      const response = await fetch('/api/shift-assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignments,
          templateId: bulkData.templateId
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Başarılı",
          description: `${result.successCount} atama başarıyla oluşturuldu`,
        });
        setBulkModalOpen(false);
        setBulkData({
          templateId: '',
          startDate: '',
          endDate: '',
          selectedPersonnel: [],
          selectedDays: [1, 2, 3, 4, 5]
        });
      } else {
        toast({
          title: "Hata",
          description: "Toplu atama sırasında hata oluştu",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating bulk assignments:', error);
      toast({
        title: "Hata",
        description: "İşlem sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

  return (
    <div className="space-y-6">
      {message && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Vardiya Şablonları
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setBulkModalOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Toplu Atama
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Excel İndir
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Excel Yükle
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="relative overflow-hidden">
            <div 
              className="h-2 w-full"
              style={{ backgroundColor: template.color }}
            ></div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                {template.isDefault && (
                  <Badge className="bg-blue-100 text-blue-800">Varsayılan</Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Time Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Başlangıç:</span>
                  <span className="font-medium">{template.startTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Bitiş:</span>
                  <span className="font-medium">{template.endTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Çalışma Saati:</span>
                  <span className="font-medium">{template.workingHours} saat</span>
                </div>
              </div>

              {/* Color Preview */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Renk:</span>
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: template.color }}
                ></div>
                <span className="text-xs text-gray-500">{template.color}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => createShiftFromTemplate(template)}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Vardiya Oluştur
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Şablon Kullanım İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Toplam Şablon</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {templates.filter(t => t.isDefault).length}
              </div>
              <div className="text-sm text-gray-600">Varsayılan Şablon</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {templates.filter(t => !t.isDefault).length}
              </div>
              <div className="text-sm text-gray-600">Özel Şablon</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Assignment Modal */}
      <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Toplu Vardiya Atama</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Template Selection */}
            <div>
              <Label>Vardiya Şablonu</Label>
              <Select 
                value={bulkData.templateId} 
                onValueChange={(value) => setBulkData({...bulkData, templateId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şablon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: template.color }}
                        ></div>
                        {template.name} ({template.startTime}-{template.endTime})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input 
                  type="date" 
                  value={bulkData.startDate}
                  onChange={(e) => setBulkData({...bulkData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input 
                  type="date" 
                  value={bulkData.endDate}
                  onChange={(e) => setBulkData({...bulkData, endDate: e.target.value})}
                />
              </div>
            </div>

            {/* Days of Week Selection */}
            <div>
              <Label className="mb-3 block">Çalışma Günleri</Label>
              <div className="grid grid-cols-7 gap-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      checked={bulkData.selectedDays.includes(index)}
                      onChange={(e) => {
                        const days = e.target.checked
                          ? [...bulkData.selectedDays, index]
                          : bulkData.selectedDays.filter(d => d !== index);
                        setBulkData({...bulkData, selectedDays: days});
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`day-${index}`} className="text-sm">
                      {day.slice(0, 3)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Personnel Selection */}
            <div>
              <Label className="mb-3 block">Personel Seçimi</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2">
                {personnel.map((person) => (
                  <div key={person.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`person-${person.id}`}
                      checked={bulkData.selectedPersonnel.includes(person.id)}
                      onChange={(e) => {
                        const personnel = e.target.checked
                          ? [...bulkData.selectedPersonnel, person.id]
                          : bulkData.selectedPersonnel.filter(p => p !== person.id);
                        setBulkData({...bulkData, selectedPersonnel: personnel});
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`person-${person.id}`} className="text-sm">
                      {person.firstName} {person.lastName} - {person.position}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {bulkData.selectedPersonnel.length > 0 && bulkData.startDate && bulkData.endDate && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Atama Özeti</h4>
                <div className="text-sm space-y-1">
                  <div>Seçilen Personel: {bulkData.selectedPersonnel.length} kişi</div>
                  <div>Seçilen Günler: {bulkData.selectedDays.map(d => dayNames[d].slice(0, 3)).join(', ')}</div>
                  <div>Tarih Aralığı: {bulkData.startDate} - {bulkData.endDate}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setBulkModalOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleBulkAssignment} disabled={loading}>
              {loading ? 'Atamalar Oluşturuluyor...' : 'Toplu Atama Yap'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}