import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  Minus,
  Database,
  Filter,
  BarChart3,
  Table as TableIcon,
  Download,
  Eye,
  Settings,
  Info,
  Play
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DataSource {
  id: string;
  name: string;
  table: string;
  description: string;
  fields: DataField[];
}

interface DataField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  aggregatable: boolean;
}

interface ReportConfig {
  name: string;
  description: string;
  dataSource: string;
  selectedFields: string[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  chartType: 'table' | 'bar' | 'pie' | 'line';
  limit: number;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string;
  value2?: string; // For 'between' operator
}

export function ReportBuilder() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    dataSource: '',
    selectedFields: [],
    filters: [],
    groupBy: [],
    sortBy: '',
    sortOrder: 'asc',
    chartType: 'table',
    limit: 100
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = () => {
    // Predefined data sources
    const sources: DataSource[] = [
      {
        id: 'personnel',
        name: 'Personel Bilgileri',
        table: 'personnel',
        description: 'Personel temel bilgileri ve demografik veriler',
        fields: [
          { id: 'firstName', name: 'Ad', type: 'string', description: 'Personelin adı', aggregatable: false },
          { id: 'lastName', name: 'Soyad', type: 'string', description: 'Personelin soyadı', aggregatable: false },
          { id: 'email', name: 'E-posta', type: 'string', description: 'E-posta adresi', aggregatable: false },
          { id: 'phone', name: 'Telefon', type: 'string', description: 'Telefon numarası', aggregatable: false },
          { id: 'position', name: 'Pozisyon', type: 'string', description: 'İş pozisyonu', aggregatable: true },
          { id: 'departmentId', name: 'Departman', type: 'string', description: 'Departman bilgisi', aggregatable: true },
          { id: 'hireDate', name: 'İşe Başlama', type: 'date', description: 'İşe başlama tarihi', aggregatable: false },
          { id: 'salary', name: 'Maaş', type: 'number', description: 'Maaş bilgisi', aggregatable: true },
          { id: 'isActive', name: 'Aktif', type: 'boolean', description: 'Aktiflik durumu', aggregatable: true }
        ]
      },
      {
        id: 'leave_requests',
        name: 'İzin Talepleri',
        table: 'leave_requests',
        description: 'İzin talepleri ve onay durumları',
        fields: [
          { id: 'personnelId', name: 'Personel ID', type: 'string', description: 'Talebi yapan personel', aggregatable: true },
          { id: 'leaveTypeId', name: 'İzin Türü', type: 'string', description: 'İzin türü', aggregatable: true },
          { id: 'startDate', name: 'Başlangıç Tarihi', type: 'date', description: 'İzin başlangıç tarihi', aggregatable: false },
          { id: 'endDate', name: 'Bitiş Tarihi', type: 'date', description: 'İzin bitiş tarihi', aggregatable: false },
          { id: 'status', name: 'Durum', type: 'string', description: 'Onay durumu', aggregatable: true },
          { id: 'reason', name: 'Sebep', type: 'string', description: 'İzin sebebi', aggregatable: false },
          { id: 'createdAt', name: 'Oluşturma Tarihi', type: 'date', description: 'Talep oluşturma tarihi', aggregatable: false }
        ]
      },
      {
        id: 'shift_assignments',
        name: 'Vardiya Atamaları',
        table: 'shift_assignments',
        description: 'Personel vardiya atama bilgileri',
        fields: [
          { id: 'personnelId', name: 'Personel ID', type: 'string', description: 'Atanan personel', aggregatable: true },
          { id: 'shiftId', name: 'Vardiya ID', type: 'string', description: 'Vardiya bilgisi', aggregatable: true },
          { id: 'date', name: 'Tarih', type: 'date', description: 'Vardiya tarihi', aggregatable: false },
          { id: 'isActive', name: 'Aktif', type: 'boolean', description: 'Aktiflik durumu', aggregatable: true },
          { id: 'createdAt', name: 'Oluşturma', type: 'date', description: 'Atama tarihi', aggregatable: false }
        ]
      },
      {
        id: 'attendance',
        name: 'Devam Kayıtları',
        table: 'attendance',
        description: 'QR kod ile giriş-çıkış kayıtları',
        fields: [
          { id: 'personnelId', name: 'Personel ID', type: 'string', description: 'Personel bilgisi', aggregatable: true },
          { id: 'type', name: 'Tür', type: 'string', description: 'Giriş/Çıkış', aggregatable: true },
          { id: 'timestamp', name: 'Zaman', type: 'date', description: 'Kayıt zamanı', aggregatable: false },
          { id: 'location', name: 'Konum', type: 'string', description: 'Kayıt konumu', aggregatable: true },
          { id: 'method', name: 'Yöntem', type: 'string', description: 'QR/Manual', aggregatable: true }
        ]
      }
    ];

    setDataSources(sources);
  };

  const getSelectedDataSource = () => {
    return dataSources.find(ds => ds.id === config.dataSource);
  };

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    };
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }));
  };

  const updateFilter = (id: string, updates: Partial<ReportFilter>) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map(filter => 
        filter.id === id ? { ...filter, ...updates } : filter
      )
    }));
  };

  const removeFilter = (id: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter(filter => filter.id !== id)
    }));
  };

  const generatePreview = async () => {
    if (!config.dataSource || config.selectedFields.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen veri kaynağı ve alanları seçin",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate report generation with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock preview data
      const mockData = generateMockData();
      setPreviewData(mockData);
      setShowPreview(true);
      
      toast({
        title: "Önizleme Hazır",
        description: "Rapor önizlemesi başarıyla oluşturuldu",
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Hata",
        description: "Önizleme oluşturulurken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const selectedDataSource = getSelectedDataSource();
    if (!selectedDataSource) return [];

    // Generate sample data based on selected fields
    const mockRows = [];
    for (let i = 0; i < Math.min(config.limit, 10); i++) {
      const row: any = {};
      config.selectedFields.forEach(fieldId => {
        const field = selectedDataSource.fields.find(f => f.id === fieldId);
        if (field) {
          switch (field.type) {
            case 'string':
              row[fieldId] = field.id === 'firstName' ? ['Ahmet', 'Mehmet', 'Ayşe', 'Fatma'][i % 4] :
                           field.id === 'lastName' ? ['Yılmaz', 'Demir', 'Kaya', 'Öz'][i % 4] :
                           field.id === 'position' ? ['Yazılımcı', 'Analiste', 'Müdür', 'Uzman'][i % 4] :
                           `Örnek ${field.name} ${i + 1}`;
              break;
            case 'number':
              row[fieldId] = Math.floor(Math.random() * 10000) + 5000;
              break;
            case 'date':
              row[fieldId] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            case 'boolean':
              row[fieldId] = Math.random() > 0.3;
              break;
          }
        }
      });
      mockRows.push(row);
    }
    return mockRows;
  };

  const saveReport = async () => {
    if (!config.name || !config.dataSource || config.selectedFields.length === 0) {
      toast({
        title: "Hata",
        description: "Lütfen rapor adı, veri kaynağı ve alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate saving report
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Rapor Kaydedildi",
        description: `${config.name} başarıyla kaydedildi`,
      });
      
      // Reset form
      setConfig({
        name: '',
        description: '',
        dataSource: '',
        selectedFields: [],
        filters: [],
        groupBy: [],
        sortBy: '',
        sortOrder: 'asc',
        chartType: 'table',
        limit: 100
      });
      setShowPreview(false);
      setPreviewData([]);
      
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Hata",
        description: "Rapor kaydedilirken hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedDataSource = getSelectedDataSource();
  const availableFields = selectedDataSource?.fields || [];
  const aggregatableFields = availableFields.filter(f => f.aggregatable);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Özelleştirilmiş raporlar oluşturmak için veri kaynağını seçin, alanları belirleyin ve filtreler ekleyin.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Rapor Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rapor Adı *</Label>
                <Input 
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({...prev, name: e.target.value}))}
                  placeholder="Örn: Departman Bazlı Personel Analizi"
                />
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea 
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({...prev, description: e.target.value}))}
                  placeholder="Rapor hakkında kısa açıklama..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Veri Kaynağı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Veri Kaynağı Seçin *</Label>
                <Select 
                  value={config.dataSource} 
                  onValueChange={(value) => setConfig(prev => ({
                    ...prev, 
                    dataSource: value,
                    selectedFields: [],
                    filters: [],
                    groupBy: []
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Veri kaynağı seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        <div>
                          <div className="font-medium">{source.name}</div>
                          <div className="text-xs text-gray-500">{source.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDataSource && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedDataSource.name}</p>
                  <p className="text-xs text-gray-600">{selectedDataSource.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {selectedDataSource.fields.length} alan mevcut
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Field Selection */}
          {selectedDataSource && (
            <Card>
              <CardHeader>
                <CardTitle>Alan Seçimi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-start space-x-2">
                      <Checkbox
                        checked={config.selectedFields.includes(field.id)}
                        onCheckedChange={(checked) => {
                          setConfig(prev => ({
                            ...prev,
                            selectedFields: checked
                              ? [...prev.selectedFields, field.id]
                              : prev.selectedFields.filter(id => id !== field.id)
                          }));
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{field.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {field.type}
                          </Badge>
                          {field.aggregatable && (
                            <Badge variant="outline" className="text-xs">
                              Toplanabilir
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{field.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          {selectedDataSource && config.selectedFields.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtreler
                  </CardTitle>
                  <Button size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-1" />
                    Filtre Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.filters.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Henüz filtre eklenmemiş. Verilerinizi sınırlamak için filtre ekleyin.
                  </p>
                ) : (
                  config.filters.map((filter) => (
                    <div key={filter.id} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Filtre</Label>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => removeFilter(filter.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <Select 
                          value={filter.field} 
                          onValueChange={(value) => updateFilter(filter.id, { field: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Alan" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select 
                          value={filter.operator} 
                          onValueChange={(value) => updateFilter(filter.id, { operator: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="İşlem" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Eşit</SelectItem>
                            <SelectItem value="contains">İçerir</SelectItem>
                            <SelectItem value="greater">Büyük</SelectItem>
                            <SelectItem value="less">Küçük</SelectItem>
                            <SelectItem value="between">Arasında</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input 
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                          placeholder="Değer"
                        />
                      </div>
                      
                      {filter.operator === 'between' && (
                        <Input 
                          value={filter.value2 || ''}
                          onChange={(e) => updateFilter(filter.id, { value2: e.target.value })}
                          placeholder="İkinci değer"
                        />
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Options */}
          {selectedDataSource && config.selectedFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Ek Seçenekler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sıralama</Label>
                    <Select 
                      value={config.sortBy} 
                      onValueChange={(value) => setConfig(prev => ({...prev, sortBy: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sıralama alanı" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.selectedFields.map((fieldId) => {
                          const field = availableFields.find(f => f.id === fieldId);
                          return field ? (
                            <SelectItem key={field.id} value={field.id}>
                              {field.name}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Sıralama Türü</Label>
                    <Select 
                      value={config.sortOrder} 
                      onValueChange={(value) => setConfig(prev => ({...prev, sortOrder: value as any}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Artan</SelectItem>
                        <SelectItem value="desc">Azalan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Grafik Türü</Label>
                    <Select 
                      value={config.chartType} 
                      onValueChange={(value) => setConfig(prev => ({...prev, chartType: value as any}))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="table">Tablo</SelectItem>
                        <SelectItem value="bar">Çubuk Grafik</SelectItem>
                        <SelectItem value="pie">Pasta Grafik</SelectItem>
                        <SelectItem value="line">Çizgi Grafik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Kayıt Limiti</Label>
                    <Input 
                      type="number" 
                      value={config.limit}
                      onChange={(e) => setConfig(prev => ({...prev, limit: parseInt(e.target.value) || 100}))}
                      min={1}
                      max={10000}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={generatePreview}
              disabled={loading || !config.dataSource || config.selectedFields.length === 0}
              className="flex-1"
            >
              {loading ? (
                <>Oluşturuluyor...</>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Önizleme
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={saveReport}
              disabled={loading || !config.name || !config.dataSource || config.selectedFields.length === 0}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Rapor Önizlemesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPreview ? (
                <div className="text-center py-12 text-gray-500">
                  <TableIcon className="mx-auto h-12 w-12 mb-4" />
                  <p>Rapor önizlemesi görüntülenmek için öncelikle yapılandırmayı tamamlayın ve "Önizleme" butonuna tıklayın.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Config Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Rapor Yapılandırması</h4>
                    <div className="text-sm space-y-1">
                      <div><strong>Veri Kaynağı:</strong> {selectedDataSource?.name}</div>
                      <div><strong>Seçili Alanlar:</strong> {config.selectedFields.length} alan</div>
                      <div><strong>Filtre:</strong> {config.filters.length} filtre</div>
                      <div><strong>Grafik:</strong> {config.chartType}</div>
                    </div>
                  </div>

                  {/* Preview Table */}
                  {previewData.length > 0 && (
                    <div className="border rounded-lg overflow-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {config.selectedFields.map((fieldId) => {
                              const field = availableFields.find(f => f.id === fieldId);
                              return field ? (
                                <th key={fieldId} className="text-left p-3 font-medium">
                                  {field.name}
                                </th>
                              ) : null;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((row, index) => (
                            <tr key={index} className="border-t">
                              {config.selectedFields.map((fieldId) => (
                                <td key={fieldId} className="p-3">
                                  {typeof row[fieldId] === 'boolean' 
                                    ? (row[fieldId] ? 'Evet' : 'Hayır')
                                    : row[fieldId]
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}