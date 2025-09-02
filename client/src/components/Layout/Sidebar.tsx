import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  Clock, 
  QrCode, 
  Building, 
  CalendarDays, 
  BarChart3, 
  Settings 
} from "lucide-react";

interface SidebarProps {
  activeItem: string;
  onMenuItemClick: (item: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'personnel', label: 'Personel Yönetimi', icon: Users },
  { id: 'leave', label: 'İzin Yönetimi', icon: Calendar },
  { id: 'shift', label: 'Vardiya Yönetimi', icon: Clock },
  { id: 'attendance', label: 'Giriş-Çıkış Takip', icon: QrCode },
  { id: 'branch', label: 'Şube Yönetimi', icon: Building },
  { id: 'calendar', label: 'Takvim', icon: CalendarDays },
  { id: 'reports', label: 'Raporlar', icon: BarChart3 },
];

export function Sidebar({ activeItem, onMenuItemClick }: SidebarProps) {
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 bg-card border-r border-border">
        {/* Logo/Header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Personel Yönetim</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onMenuItemClick(item.id)}
                className={cn(
                  "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                data-testid={`sidebar-${item.id}`}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </button>
            );
          })}

          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={() => onMenuItemClick('settings')}
              className={cn(
                "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
                activeItem === 'settings'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              data-testid="sidebar-settings"
            >
              <Settings className="mr-3 h-4 w-4" />
              Ayarlar
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
