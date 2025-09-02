import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavigation } from "./TopNavigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  activeMenuItem: string;
  onMenuItemChange: (item: string) => void;
}

export function MainLayout({ children, activeMenuItem, onMenuItemChange }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuItemClick = (item: string) => {
    onMenuItemChange(item);
    setMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar activeItem={activeMenuItem} onMenuItemClick={handleMenuItemClick} />

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar activeItem={activeMenuItem} onMenuItemClick={handleMenuItemClick} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavigation onMobileMenuToggle={handleMobileMenuToggle} />
        
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
