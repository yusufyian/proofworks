import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  FileText, AlertTriangle, Shield, ShoppingCart, TrendingUp, 
  PieChart, Sparkles, Network
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);

  const stats = data?.data || {};

  const getStatCards = () => [
    {
      title: '资产总数',
      value: stats.totalAssets || 0,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
    },
    {
      title: '侵权案例',
      value: stats.totalInfringements || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    },
    {
      title: '维权记录',
      value: stats.totalProtections || 0,
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      title: '授权交易',
      value: stats.totalLicenses || 0,
      icon: ShoppingCart,
      color: 'from-purple-500 to-pink-500',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-indigo-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Network className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
              <p className="text-indigo-100 text-lg">{format(new Date(), 'yyyy年MM月dd日')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <HelpTooltip
                  mode="hover"
                  title={stat.title}
                  content={`这是您的${stat.title}统计数据`}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedNumber value={stat.value} />
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图表 */}
        <div className="card relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">趋势分析</h2>
            </div>
          </div>
          {stats.trend30Days && stats.trend30Days.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.trend30Days.slice(-7)}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>暂无数据</p>
            </div>
          )}
        </div>

        {/* 状态分布饼图 */}
        <div className="card relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text">状态分布</h2>
            </div>
          </div>
          {stats.statusDistribution ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={Object.entries(stats.statusDistribution).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {['#10b981', '#3b82f6', '#f59e0b', '#6b7280'].map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>暂无数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

