import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Shield,
  Users,
  Settings,
  CreditCard,
  HelpCircle,
  Menu,
  X,
  Bell,
  Search,
  Sun,
  Moon,
  LineChart,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      )}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col md:flex-row bg-background transition-all duration-300'
      )}
    >
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full bg-background/80 backdrop-blur-sm border shadow-md"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-full transition-all duration-300 ease-in-out',
          sidebarOpen ? 'left-0' : '-left-full md:left-0',
          'w-64 border-r bg-card/50 backdrop-blur-sm'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gradient">Spark-X</h1>
            <p className="text-sm text-muted-foreground">Privacy-Preserving Analytics</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <SidebarItem
              icon={<LayoutDashboard />}
              label="Dashboard"
              to="/dashboard"
              active={location.pathname === '/dashboard'}
            />
            <SidebarItem
              icon={<LineChart />}
              label="Advanced Analytics"
              to="/analytics"
              active={location.pathname === '/analytics'}
            />
            <SidebarItem
              icon={<Shield />}
              label="Privacy"
              to="/privacy"
              active={location.pathname === '/privacy'}
            />
            <SidebarItem
              icon={<Users />}
              label="Users"
              to="/users"
              active={location.pathname === '/users'}
            />
            <SidebarItem
              icon={<CreditCard />}
              label="Billing"
              to="/billing"
              active={location.pathname === '/billing'}
            />
            <SidebarItem
              icon={<Settings />}
              label="Settings"
              to="/settings"
              active={location.pathname === '/settings'}
            />
            <SidebarItem
              icon={<HelpCircle />}
              label="Help"
              to="/help"
              active={location.pathname === '/help'}
            />
          </nav>

          {/* User */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient flex items-center justify-center text-white font-medium">
                JD
              </div>
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 w-full max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
