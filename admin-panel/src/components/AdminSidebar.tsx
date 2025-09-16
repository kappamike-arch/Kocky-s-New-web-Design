'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Layout, 
  Type, 
  Image, 
  Settings, 
  FileText, 
  Utensils, 
  MenuIcon, 
  Coffee, 
  Wine, 
  Star, 
  ImageIcon, 
  Briefcase, 
  Package, 
  Calendar, 
  ShoppingBag, 
  Truck, 
  CalendarDays, 
  Users, 
  BarChart, 
  LogOut, 
  ChevronRight, 
  ChevronDown, 
  X,
  Menu,
  ChevronLeft,
  Mail,
  Inbox,
  PartyPopper,
  Send
} from 'lucide-react';
import { auth } from '../lib/api/auth';
import { handleLogout } from '../lib/utils/logout';

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  children?: MenuItem[];
}

export default function AdminSidebar() {
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        setUser(userData);
      } catch {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    // Close mobile sidebar when route changes
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      setIsSidebarOpen(savedState === 'true');
    }
  }, []);

  // Listen for external sidebar state changes (from header toggle or other tabs)
  useEffect(() => {
    const syncSidebarState = () => {
      const savedState = localStorage.getItem('sidebarOpen');
      setIsSidebarOpen(savedState !== 'false');
    };
    window.addEventListener('storage', syncSidebarState);
    window.addEventListener('sidebarToggle', syncSidebarState);
    return () => {
      window.removeEventListener('storage', syncSidebarState);
      window.removeEventListener('sidebarToggle', syncSidebarState);
    };
  }, []);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem('sidebarOpen', String(newState));
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const onLogout = () => {
    handleLogout();
  };

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/', icon: Home },
    { 
      name: 'Content Management', 
      path: '', 
      icon: Layout,
      children: [
        { name: 'Page Content', path: '/page-content/', icon: Type },
        { name: 'Hero Settings', path: '/hero-settings/', icon: Image },
        { name: 'Service Settings', path: '/service-settings/', icon: Settings },
        { name: 'Website Content', path: '/content/', icon: FileText },
        { name: 'Media Library', path: '/media/', icon: Image },
      ]
    },
    {
      name: 'Menu Management',
      path: '',
      icon: Utensils,
      children: [
        { name: 'Enhanced Menus', path: '/menu-management/', icon: MenuIcon },
        { name: 'Regular Menu', path: '/menu/', icon: Coffee },
        { name: 'Happy Hour', path: '/menu-management/?type=HAPPY_HOUR', icon: Wine },
        { name: 'Brunch Menu', path: '/menu-management/?type=BRUNCH', icon: Coffee },
        { name: 'Specials', path: '/menu-management/?type=SPECIALS', icon: Star },
      ]
    },
    { 
      name: 'Gallery', 
      path: '/gallery/', 
      icon: ImageIcon 
    },
    {
      name: 'CRM & Quotes',
      path: '',
      icon: Briefcase,
      children: [
        { name: 'CRM', path: '/crm/', icon: Briefcase },
        { name: 'Quotes', path: '/quotes/', icon: FileText },
        { name: 'Quote Config', path: '/quote-config/', icon: Package },
      ]
    },
    {
      name: 'Email Marketing',
      path: '',
      icon: Mail,
      children: [
        { name: 'Overview', path: '/email/', icon: Mail },
        { name: 'Contacts', path: '/email/contacts/', icon: Users },
        { name: 'Templates', path: '/email-templates/', icon: FileText },
        { name: 'Template Studio', path: '/email-studio/inquiry', icon: Layout },
        { name: 'Campaigns', path: '/email/campaigns/', icon: Send },
      ]
    },
    {
      name: 'Services',
      path: '',
      icon: Wine,
      children: [
        { name: 'Reservations', path: '/reservations/', icon: Calendar },
        { name: 'Orders', path: '/orders/', icon: ShoppingBag },
        { name: 'Food Truck', path: '/food-truck/', icon: Truck },
        { name: 'Mobile Bar', path: '/mobile-bar/', icon: Wine },
        { name: 'Events', path: '/events/', icon: PartyPopper },
      ]
    },
    { name: 'Calendar', path: '/calendar/', icon: CalendarDays },
    { name: 'Job Applications', path: '/jobs/', icon: Briefcase },
    { name: 'Users', path: '/users/', icon: Users },
    { name: 'Analytics', path: '/analytics/', icon: BarChart },
    { name: 'Settings', path: '/settings/', icon: Settings },
  ];

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.name);

    if (hasChildren) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center justify-between px-3 py-2 admin-tab ${
              depth > 0 ? 'ml-4' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="admin-icon" />
              {(isSidebarOpen || isMobileSidebarOpen) && <span>{item.name}</span>}
            </div>
            {(isSidebarOpen || isMobileSidebarOpen) && (
              isExpanded ? <ChevronDown className="admin-icon" /> : <ChevronRight className="admin-icon" />
            )}
          </button>
          {isExpanded && (isSidebarOpen || isMobileSidebarOpen) && (
            <div className="mt-1">
              {item.children?.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        href={item.path}
        className={`flex items-center gap-3 px-3 py-2 admin-tab ${
          depth > 0 ? 'ml-8' : ''
        } ${
          isActive ? 'active' : ''
        }`}
        title={!isSidebarOpen && !isMobileSidebarOpen ? item.name : undefined}
      >
        <Icon className="admin-icon" />
        {(isSidebarOpen || isMobileSidebarOpen) && <span>{item.name}</span>}
      </Link>
    );
  };

  // Don't show sidebar on login page
  if (pathname === '/login') return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 admin-button"
      >
        {isMobileSidebarOpen ? <X className="admin-icon" /> : <Menu className="admin-icon" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen admin-card transition-all duration-300 z-40 flex flex-col ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
        style={{ maxHeight: '100vh' }}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 admin-card-header">
          {isSidebarOpen || isMobileSidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="admin-h3">Kocky's Admin</h1>
                <span className="admin-status admin-status-success">
                  SECURE
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="admin-button admin-button-secondary lg:block hidden"
              >
                <ChevronLeft className="admin-icon" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="admin-button admin-button-secondary mx-auto"
            >
              <Menu className="admin-icon" />
            </button>
          )}
        </div>

        {/* Security Warning */}
        <div className={`px-4 py-2 admin-status admin-status-error ${!isSidebarOpen && !isMobileSidebarOpen ? 'hidden' : ''}`}>
          <p className="admin-help">
            🔒 Authorized Personnel Only
          </p>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden">
          <nav className="h-full overflow-y-auto overflow-x-hidden p-4 space-y-1 custom-scrollbar">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className={`p-4 admin-card-header ${!isSidebarOpen && !isMobileSidebarOpen ? 'hidden lg:block' : ''}`}>
          {isSidebarOpen || isMobileSidebarOpen ? (
            <>
              <div className="mb-3 text-sm">
                <p className="admin-help">Logged in as:</p>
                <p className="admin-label truncate">{user?.email}</p>
                <p className="admin-help">{user?.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full admin-button admin-button-secondary"
              >
                <LogOut className="admin-icon" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogout}
              className="w-full admin-button admin-button-secondary"
              title="Logout"
            >
              <LogOut className="admin-icon" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
