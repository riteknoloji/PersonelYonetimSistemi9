import { Users, Calendar, Clock, Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsData {
  totalPersonnel: number;
  onLeaveToday: number;
  activeShifts: number;
  pendingLeaves: number;
}

interface StatsCardsProps {
  stats: StatsData;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const statsItems = [
    {
      title: "Toplam Personel",
      value: stats.totalPersonnel,
      icon: Users,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      change: "+5.2%",
      changeText: "geçen aya göre",
      changeColor: "text-green-600"
    },
    {
      title: "Bugün İzinli",
      value: stats.onLeaveToday,
      icon: Calendar,
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-600",
      change: "8.2%",
      changeText: "toplam personelin",
      changeColor: "text-yellow-600"
    },
    {
      title: "Aktif Vardiyalar",
      value: stats.activeShifts,
      icon: Clock,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      change: "Aktif",
      changeText: "şu anda çalışıyor",
      changeColor: "text-green-600"
    },
    {
      title: "Bekleyen İzinler",
      value: stats.pendingLeaves,
      icon: Hourglass,
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-600",
      change: "Onay bekliyor",
      changeText: "işlem gerekli",
      changeColor: "text-orange-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-8 bg-muted rounded w-16"></div>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statsItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="shadow-sm" data-testid={`stats-card-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground" data-testid={`stats-value-${index}`}>
                    {item.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${item.iconColor}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`font-medium ${item.changeColor}`}>
                  {item.change}
                </span>
                <span className="text-muted-foreground ml-1">
                  {item.changeText}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
