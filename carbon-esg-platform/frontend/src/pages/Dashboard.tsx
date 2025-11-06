import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  FileText, Leaf, TrendingDown, Award, Activity, Zap, 
  BarChart3, PieChart, Sparkles, Globe, Factory
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);

  const stats = data?.data || {};

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'enterprise':
        return '企业用户';
      case 'supplier':
        return '供应商';
      case 'verifier':
        return '核证机构';
      default:
        return '用户';
    }
  };

  const chartColors = {
    primary: '#16a34a',
    secondary: '#22c55e',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  };

  const getStatCards = () => {
    return [
      {
        title: '总碳排放量',
        value: stats.totalEmissions || 0,
        icon: Factory,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        unit: 'tCO2e',
        subtitle: `范围1: ${(stats.scope1Emissions || 0).toFixed(1)} | 范围2: ${(stats.scope2Emissions || 0).toFixed(1)}`,
        gradient: 'linear-gradient(135deg, #16a34a 0%, #10b981 100%)',
      },
      {
        title: '产品碳足迹',
        value: stats.totalProducts || 0,
        icon: Leaf,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        subtitle: `已核证: ${stats.verifiedProducts || 0}个`,
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      },
      {
        title: '减排项目',
        value: stats.totalProjects || 0,
        icon: TrendingDown,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        subtitle: `已认证: ${stats.certifiedProjects || 0}个 | 减排量: ${(stats.totalReduction || 0).toFixed(1)} tCO2e`,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      },
      {
        title: 'ESG报告',
        value: stats.totalReports || 0,
        icon: Award,
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-50',
        subtitle: `已发布: ${stats.publishedReports || 0}份`,
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      },
    ];
  };

  const getTrendData = () => {
    const trend = timeRange === '7d' ? stats.trend7Days : stats.trend30Days;
    if (!trend || trend.length === 0) return [];
    
    return trend.map((item: any) => ({
      date: format(new Date(item.date), timeRange === '7d' ? 'MM/dd' : 'MM/dd'),
      emissions: (item.emissions || 0) / 1000, // 转换为千吨
      reduction: (item.reduction || 0) / 100, // 转换为百吨
    }));
  };

  const getScopeDistribution = () => {
    if (stats.scope1Emissions || stats.scope2Emissions || stats.scope3Emissions) {
      return [
        { name: '范围1', value: stats.scope1Emissions || 0, color: chartColors.success },
        { name: '范围2', value: stats.scope2Emissions || 0, color: chartColors.primary },
        { name: '范围3', value: stats.scope3Emissions || 0, color: chartColors.warning },
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
  const scopeData = getScopeDistribution();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
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
                  <Globe className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
                  <p className="text-primary-100 text-lg flex items-center space-x-2">
                    <span>{getRoleLabel()}</span>
                    <span>·</span>
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
                <Zap className="w-5 h-5" />
                <span className="font-medium">实时数据</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className="flex items-center space-x-2">
                  <HelpTooltip
                    mode="hover"
                    title={stat.title}
                    content={
                      stat.title === '总碳排放量'
                        ? '企业组织层面温室气体排放总量，包括范围1（直接排放）、范围2（间接排放）和范围3（其他间接排放）。'
                        : stat.title === '产品碳足迹'
                        ? '基于生命周期评价（LCA）方法计算的产品全生命周期碳排放，包括原材料、生产、运输、使用和废弃处置阶段。'
                        : stat.title === '减排项目'
                        ? '企业实施的各类减排项目，包括可再生能源、能效提升、林业碳汇等，可产生CCER等碳资产。'
                        : stat.title === 'ESG报告'
                        ? '企业环境、社会和治理（ESG）信息披露报告，符合GRI、TCFD、ISSB等国际标准。'
                        : ''
                    }
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  <AnimatedNumber value={stat.value} />
                  {stat.unit && <span className="text-lg text-gray-500 ml-2">{stat.unit}</span>}
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
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">排放趋势</h2>
                  <p className="text-sm text-gray-500">碳排放变化趋势</p>
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
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorReduction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.secondary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.secondary} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
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
                    yAxisId="left"
                    type="monotone"
                    dataKey="emissions"
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#colorEmissions)"
                    name="碳排放(千吨)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="reduction"
                    stroke={chartColors.secondary}
                    fillOpacity={1}
                    fill="url(#colorReduction)"
                    name="减排量(百吨)"
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
                <h2 className="text-2xl font-bold gradient-text">范围分布</h2>
                <p className="text-sm text-gray-500">碳排放范围占比</p>
              </div>
            </div>
            {scopeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={scopeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scopeData.map((entry, index) => (
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
