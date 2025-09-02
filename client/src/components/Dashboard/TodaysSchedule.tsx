import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// For now using static data, will be replaced with API data later
const todaySchedule = [
  {
    id: 1,
    name: "Sabah Vardiyası",
    time: "08:00 - 16:00",
    count: 15,
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Akşam Vardiyası",
    time: "16:00 - 00:00",
    count: 12,
    color: "bg-orange-500"
  },
  {
    id: 3,
    name: "Gece Vardiyası",
    time: "00:00 - 08:00",
    count: 8,
    color: "bg-purple-500"
  }
];

export function TodaysSchedule() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Bugünün Programı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todaySchedule.map((shift) => (
            <div 
              key={shift.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              data-testid={`schedule-shift-${shift.id}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 ${shift.color} rounded-full`}></div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {shift.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {shift.time}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground" data-testid={`shift-count-${shift.id}`}>
                {shift.count} kişi
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
