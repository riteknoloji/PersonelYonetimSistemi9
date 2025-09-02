import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Calendar, Clock, AlertTriangle } from "lucide-react";

// For now using static data, will be replaced with API data later
const activities = [
  {
    id: 1,
    type: "user_added",
    user: "Mehmet Demir",
    action: "sisteme yeni personel ekledi",
    time: "2 saat önce",
    icon: UserPlus,
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600"
  },
  {
    id: 2,
    type: "leave_approved",
    user: "Ayşe Kaya",
    action: "izin talebini onayladı",
    time: "4 saat önce",
    icon: Calendar,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600"
  },
  {
    id: 3,
    type: "shift_changed",
    user: "Ali Özkan",
    action: "vardiya değişikliği yaptı",
    time: "6 saat önce",
    icon: Clock,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600"
  },
  {
    id: 4,
    type: "warning",
    user: "Sistem",
    action: "geç kalma uyarısı gönderdi",
    time: "1 gün önce",
    icon: AlertTriangle,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600"
  }
];

export function RecentActivities() {
  const handleViewAllActivities = () => {
    // TODO: Navigate to activities page
    console.log("Navigate to all activities");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Son Aktiviteler</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleViewAllActivities}
            data-testid="view-all-activities"
          >
            Tümünü Gör
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id}
                className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
                data-testid={`activity-${activity.id}`}
              >
                <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`text-sm ${activity.iconColor}`} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span>{activity.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
