import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Search, 
  AlertTriangle, 
  BarChart3,
  Menu,
  X,
  Shield,
  TrendingUp,
  Bot
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import { AIAssistantSidebar } from './AIAssistantSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘', help: '查看系统整体统计信息和关键指标，包括产品数量、批次状态、事件统计等。' },
  { path: '/products', icon: Package, label: '产品管理', help: '管理产品档案，包括产品基本信息、产地信息、企业资质等。支持按类别、品牌、关键词搜索。' },
  { path: '/batches', icon: BarChart3, label: '批次管理', help: '查看和管理产品批次信息，包括批次状态、流转记录、质检报告等。支持按产品、状态、日期筛选。' },
  { path: '/trace', icon: Search, label: '追溯查询', help: '通过追溯码或批次号查询产品的完整溯源信息，包括流转路径、IoT数据、质检报告等。' },
  { path: '/recalls', icon: AlertTriangle, label: '召回管理', help: '管理产品召回记录，包括召回原因、风险等级、召回进度跟踪等。支持按状态、风险等级筛选。' },
  { path: '/analytics', icon: TrendingUp, label: '数据分析', help: '全方位数据洞察与趋势分析，包括宏观KPI、温控合规、物流绩效、质量分析等。' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiAssistantOpen, setAIAssistantOpen] = useState(false);

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-white to-gray-50 shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white block">追溯平台</span>
                <span className="text-xs text-primary-100">Traceability Platform</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`} />
                      <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700 group-hover:text-primary-600'}`}>
                        {item.label}
                      </span>
                    </div>
                    <HelpTooltip
                      mode="hover"
                      title={item.label}
                      content={item.help}
                      className={isActive ? 'text-white/80' : 'text-gray-400'}
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* 底部信息 */}
          <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">系统运行正常</span>
            </div>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={`lg:pl-72 transition-all duration-300 ${aiAssistantOpen ? 'lg:pr-96' : ''}`}>
        {/* 顶部栏 */}
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
              {/* AI助手按钮 */}
              <button
                onClick={() => setAIAssistantOpen(true)}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 group ${
                  aiAssistantOpen
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-600'
                    : 'bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200'
                }`}
                title={aiAssistantOpen ? '关闭AI助手' : '打开AI助手'}
              >
                <Bot className={`w-5 h-5 group-hover:scale-110 transition-transform ${aiAssistantOpen ? 'text-white' : 'text-purple-600'}`} />
                <span className={`text-sm font-medium ${aiAssistantOpen ? 'text-white' : 'text-purple-700'}`}>AI助手</span>
              </button>
              {/* 系统状态 */}
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-primary-700">系统正常</span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* AI助手侧边栏 */}
      <AIAssistantSidebar isOpen={aiAssistantOpen} onClose={() => setAIAssistantOpen(false)} />
    </div>
  );
};
