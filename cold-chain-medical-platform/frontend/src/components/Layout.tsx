import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Truck,
  Cpu,
  LogOut,
  Menu,
  X,
  Snowflake,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navigation = [
  { name: '仪表盘', href: '/', icon: LayoutDashboard },
  { name: '批次管理', href: '/batches', icon: Package },
  { name: '温控监控', href: '/temperature', icon: Snowflake },
  { name: '告警管理', href: '/alerts', icon: AlertTriangle },
  { name: '运输管理', href: '/transports', icon: Truck },
  { name: '设备管理', href: '/devices', icon: Cpu },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout, loadUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getRoleLabel = () => {
    const roleMap: Record<string, string> = {
      admin: '系统管理员',
      warehouse: '仓储管理员',
      logistics: '物流管理员',
      pharmacy: '药店管理员',
      regulator: '监管人员',
    };
    return roleMap[user?.role || ''] || '用户';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Snowflake className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">冷链医药</span>
                <span className="text-xs text-primary-100">Cold Chain Medical</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`} />
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary-600'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">
                  {user?.name?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-primary-600 font-medium mt-0.5">{getRoleLabel()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 border border-gray-200 hover:border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary-700">系统正常</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}



