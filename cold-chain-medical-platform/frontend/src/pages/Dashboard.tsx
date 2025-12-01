import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  Package, AlertTriangle, Truck, Cpu, TrendingUp, CheckCircle2, 
  Activity, BarChart3, PieChart, Sparkles, Snowflake, Thermometer
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);

  const stats = data?.data || {};

  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  };

  const getStatCards = () => {
    return [
      {
        title: '总批次数',
        value: stats.totalBatches || 0,
        icon: Package,
        color: 'from-blue-500 to-cyan-500',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        helpContent: '系统中所有药品批次的总数，包括在库、在途、已交付等所有状态的批次。',
      },
      {
        title: '活跃批次',
        value: stats.activeBatches || 0,
        icon: Activity,
        color: 'from-green-500 to-emerald-500',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        helpContent: '当前处于在库或在途状态的批次数量，这些批次需要持续监控温控状态。',
      },
      {
        title: '在线设备',
        value: stats.onlineDevices || 0,
        icon: Cpu,
        color: 'from-purple-500 to-pink-500',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        subtitle: `共 ${stats.totalDevices || 0} 台设备`,
        helpContent: '当前在线并正常工作的温控监测设备数量。设备离线会影响数据采集和告警。',
      },
      {
        title: '待处理告警',
        value: stats.pendingAlerts || 0,
        icon: AlertTriangle,
        color: 'from-orange-500 to-amber-500',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        subtitle: `总计 ${stats.totalAlerts || 0} 条告警`,
        helpContent: '需要立即处理的告警数量。告警包括温度异常、设备故障、开门异常等情况。',
      },
      {
        title: '在途运输',
        value: stats.inTransitTransports || 0,
        icon: Truck,
        color: 'from-indigo-500 to-blue-500',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        subtitle: `总计 ${stats.totalTransports || 0} 单`,
        helpContent: '当前正在运输途中的运输单数量。运输过程中需要实时监控温控数据。',
      },
      {
        title: '合规率',
        value: parseFloat(stats.complianceRate || '100'),
        icon: CheckCircle2,
        color: 'from-green-500 to-teal-500',
        gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
        subtitle: '%',
        isPercentage: true,
        helpContent: '所有批次中符合GSP温控标准的比例。合规率≥99.5%为优秀，<95%需要重点关注。',
      },
    ];
  };

  const getTrendData = () => {
    const trend = timeRange === '7d' ? stats.trend7Days : stats.trend30Days;
    if (!trend || trend.length === 0) return [];
    
    return trend.map((item: any) => ({
      date: format(new Date(item.date), timeRange === '7d' ? 'MM/dd' : 'MM/dd'),
      batches: item.batches || 0,
      alerts: item.alerts || 0,
    }));
  };

  const getStatusDistribution = () => {
    if (stats.batchStatus) {
      return [
        { name: '在库', value: stats.batchStatus.in_storage || 0, color: chartColors.success },
        { name: '在途', value: stats.batchStatus.in_transit || 0, color: chartColors.primary },
        { name: '已交付', value: stats.batchStatus.delivered || 0, color: chartColors.info },
        { name: '已隔离', value: stats.batchStatus.isolated || 0, color: chartColors.danger },
      ].filter(item => item.value > 0);
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-600 animate-pulse" />
        </div>
      </div>
    );
  }

  const trendData = getTrendData();
  const statusData = getStatusDistribution();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}></div>

      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 text-white shadow-2xl border border-primary-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }}></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <Snowflake className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
                  <p className="text-primary-100 text-lg flex items-center space-x-2">
                    <span>{format(new Date(), 'yyyy年MM月dd日')}</span>
                    <span>·</span>
                    <span className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>系统运行正常</span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <Thermometer className="w-5 h-5" />
                <span className="font-medium">实时监控</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatCards().map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group relative overflow-hidden border border-gray-200/50 hover:border-primary-300/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
            }}
          >
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle, ${stat.gradient}, transparent 70%)`,
                filter: 'blur(40px)',
              }}
            ></div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <stat.icon className="w-8 h-8 text-white relative z-10" />
                </div>
                <HelpTooltip
                  mode="click"
                  title={stat.title}
                  content={stat.helpContent}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.isPercentage ? (
                    <>
                      <AnimatedNumber 
                        value={stat.value} 
                        decimals={2}
                      />%
                    </>
                  ) : (
                    <AnimatedNumber value={stat.value} />
                  )}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{stat.subtitle}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">趋势分析</h2>
                  <p className="text-sm text-gray-500">批次与告警变化趋势</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeRange === '7d'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7天
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeRange === '30d'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  30天
                </button>
              </div>
            </div>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorBatches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.danger} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="batches"
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#colorBatches)"
                    name="批次"
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke={chartColors.danger}
                    fillOpacity={1}
                    fill="url(#colorAlerts)"
                    name="告警"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">批次状态分布</h2>
                <p className="text-sm text-gray-500">当前批次状态占比</p>
              </div>
            </div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



