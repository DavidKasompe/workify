'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, 
  Calendar, 
  Settings, 
  PanelLeft,
  PanelRight,
  Loader2,
  LogOut,
} from 'lucide-react';

const navigation = [
  {
    name: 'Boards',
    href: '/dashboard',
    icon: LayoutGrid,
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-r border-gray-100 dark:border-gray-800 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
          {!collapsed && (
            <span className="text-xl font-medium text-gray-700 dark:text-gray-200">Workify</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/80 transition-colors"
          >
            {collapsed ? (
              <PanelRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <PanelLeft className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = 
              item.href === '/dashboard' 
                ? pathname === '/dashboard' || pathname.startsWith('/dashboard/boards')
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center ${
                  collapsed ? 'justify-center' : 'justify-between'
                } p-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gray-50/80 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-5 h-5 ${
                    isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  {!collapsed && <span className="text-sm">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center' : 'justify-between'
            } p-3 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100`}
          >
            <div className="flex items-center space-x-3">
              <LogOut className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </div>
          </button>
        </div>
      </div>

      {}
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
} 