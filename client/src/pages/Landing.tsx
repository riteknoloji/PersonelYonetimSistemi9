import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Clock, BarChart3, Calendar, Building } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: Users,
      title: "Personel Yönetimi",
      description: "Tüm personel bilgilerini merkezi bir sistemde yönetin"
    },
    {
      icon: Calendar,
      title: "İzin Yönetimi",
      description: "İzin talepleri ve onay süreçlerini dijital ortamda takip edin"
    },
    {
      icon: Clock,
      title: "Vardiya Yönetimi",
      description: "Çalışma saatleri ve vardiya planlamalarını organize edin"
    },
    {
      icon: Shield,
      title: "QR Kod Giriş-Çıkış",
      description: "Güvenli ve hızlı personel giriş-çıkış takibi"
    },
    {
      icon: Building,
      title: "Şube Yönetimi",
      description: "Çoklu şube operasyonlarını tek platformdan yönetin"
    },
    {
      icon: BarChart3,
      title: "Raporlama",
      description: "Detaylı analiz ve raporlarla performansı izleyin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Personel Yönetim Sistemi</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Modern teknolojilerle geliştirilmiş kapsamlı personel yönetim sistemi. 
            İnsan kaynakları süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
          </p>
          <Button size="lg" onClick={handleLogin} data-testid="login-button">
            Sisteme Giriş Yap
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-8">Neden Bu Sistemi Seçmelisiniz?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Zaman Tasarrufu</h3>
              <p className="text-muted-foreground">
                Manuel süreçleri otomatikleştirerek zamanınızı daha verimli kullanın
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Güvenli Veriler</h3>
              <p className="text-muted-foreground">
                Tüm personel verileri güvenli şekilde saklanır ve korunur
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Akıllı Analiz</h3>
              <p className="text-muted-foreground">
                Detaylı raporlar ve analizlerle daha iyi kararlar alın
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-muted-foreground">
            © 2024 Personel Yönetim Sistemi. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
