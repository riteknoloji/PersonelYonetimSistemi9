import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, CalendarPlus, FileText, Megaphone } from "lucide-react";

interface QuickActionsProps {
  onAddPersonnel: () => void;
  onCreateShift: () => void;
  onGenerateReport: () => void;
  onSendNotification: () => void;
}

export function QuickActions({ 
  onAddPersonnel, 
  onCreateShift, 
  onGenerateReport, 
  onSendNotification 
}: QuickActionsProps) {
  const quickActionItems = [
    {
      title: "Yeni Personel Ekle",
      icon: UserPlus,
      onClick: onAddPersonnel,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "quick-action-add-personnel"
    },
    {
      title: "Vardiya Oluştur",
      icon: CalendarPlus,
      onClick: onCreateShift,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      testId: "quick-action-create-shift"
    },
    {
      title: "Rapor Oluştur",
      icon: FileText,
      onClick: onGenerateReport,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-600",
      testId: "quick-action-generate-report"
    },
    {
      title: "Bildirim Gönder",
      icon: Megaphone,
      onClick: onSendNotification,
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-600",
      testId: "quick-action-send-notification"
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Hızlı İşlemler</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start space-x-3 h-auto p-3"
                onClick={item.onClick}
                data-testid={item.testId}
              >
                <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-sm ${item.iconColor}`} size={16} />
                </div>
                <span className="text-sm">{item.title}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
