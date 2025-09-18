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
  ChevronLeft
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['Email Marketing']));
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      try {
        const userData = JSON.parse(atob(token));
        setUser(userData);
      } catch {
        router.push('/');
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
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { 
      name: 'Content Management', 
      path: '', 
      icon: Layout,
      children: [
        { name: 'Page Content', path: '/page-content', icon: Type },
        { name: 'Hero Settings', path: '/hero-settings', icon: Image },
        { name: 'Service Settings', path: '/service-settings', icon: Settings },
        { name: 'Website Content', path: '/content', icon: FileText },
        { name: 'Media Library', path: '/media', icon: Image },
      ]
    },
    {
      name: 'Menu Management',
      path: '',
      icon: Utensils,
      children: [
        { name: 'Enhanced Menus', path: '/menu-management', icon: MenuIcon },
        { name: 'Regular Menu', path: '/menu', icon: Coffee },
        { name: 'Happy Hour', path: '/menu-management?type=HAPPY_HOUR', icon: Wine },
        { name: 'Brunch Menu', path: '/menu-management?type=BRUNCH', icon: Coffee },
        { name: 'Specials', path: '/menu-management?type=SPECIALS', icon: Star },
      ]
    },
    { 
      name: 'Gallery', 
      path: '/gallery', 
      icon: ImageIcon 
    },
    {
      name: 'CRM & Quotes',
      path: '',
      icon: Briefcase,
      children: [
        { name: 'CRM', path: '/crm', icon: Briefcase },
        { name: 'Quotes', path: '/quotes', icon: FileText },
        { name: 'Quote Config', path: '/quote-config', icon: Package },
      ]
    },
    {
      name: 'Services',
      path: '',
      icon: Wine,
      children: [
        { name: 'Reservations', path: '/reservations', icon: Calendar },
        { name: 'Orders', path: '/orders', icon: ShoppingBag },
        { name: 'Food Truck', path: '/food-truck', icon: Truck },
        { name: 'Mobile Bar', path: '/mobile-bar', icon: Wine },
      ]
    },
    { name: 'Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Analytics', path: '/analytics', icon: BarChart },
    {
      name: 'Email Marketing',
      path: '',
      icon: Type,
      children: [
        { name: 'Dashboard', path: '/email', icon: BarChart },
        { name: 'Templates', path: '/email-templates', icon: Type },
        { name: 'Visual Studio', path: '/email-studio', icon: Layout },
      ]
    },
    { name: 'Settings', path: '/settings', icon: Settings },
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              depth > 0 ? 'ml-4' : ''
            } text-gray-700 hover:bg-gray-100`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" />
              {(isSidebarOpen || isMobileSidebarOpen) && <span>{item.name}</span>}
            </div>
            {(isSidebarOpen || isMobileSidebarOpen) && (
              (isExpanded || item.name === 'Email Marketing') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {(isExpanded || item.name === 'Email Marketing') && (isSidebarOpen || isMobileSidebarOpen) && (
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
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          depth > 0 ? 'ml-8' : ''
        } ${
          isActive
            ? 'bg-gray-900 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        title={!isSidebarOpen && !isMobileSidebarOpen ? item.name : undefined}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {(isSidebarOpen || isMobileSidebarOpen) && <span>{item.name}</span>}
      </Link>
    );
  };

  // Don't show sidebar on login page
  if (pathname === '/') return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {isSidebarOpen || isMobileSidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Kocky's Admin</h1>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  SECURE
                </span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 hover:bg-gray-100 rounded lg:block hidden"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Security Warning */}
        <div className={`px-4 py-2 bg-red-50 border-b border-red-100 ${!isSidebarOpen && !isMobileSidebarOpen ? 'hidden' : ''}`}>
          <p className="text-xs text-red-700">
            🔒 Authorized Personnel Only
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>

        {/* User Info & Logout */}
        <div className={`p-4 border-t border-gray-200 ${!isSidebarOpen && !isMobileSidebarOpen ? 'hidden lg:block' : ''}`}>
          {isSidebarOpen || isMobileSidebarOpen ? (
            <>
              <div className="mb-3 text-sm">
                <p className="text-gray-500">Logged in as:</p>
                <p className="font-medium text-gray-900 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
                              onClick={onLogout}
              className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
