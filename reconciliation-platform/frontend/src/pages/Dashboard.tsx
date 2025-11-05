import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import {
  FileCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  BarChart3,
  PieChart,
  Sparkles,
  Network,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';
import AnimatedNumber from '../components/AnimatedNumber';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const { data, isLoading, error } = useQuery('dashboard-stats', dashboardApi.getStats);

  // 调试信息
  useEffect(() => {
    if (error) {
      console.error('[Dashboard] API Error:', error);
    }
    if (data) {
      console.log('[Dashboard] === 数据调试开始 ===');
      console.log('[Dashboard] 完整响应对象:', data);
      console.log('[Dashboard] 响应类型:', typeof data);
      console.log('[Dashboard] 响应的 keys:', Object.keys(data || {}));
      console.log('[Dashboard] data.data:', data.data);
      console.log('[Dashboard] data.data 的类型:', typeof data.data);
      if (data.data) {
        console.log('[Dashboard] data.data 的 keys:', Object.keys(data.data));
        console.log('[Dashboard] data.data.data:', data.data.data);
        console.log('[Dashboard] data.data.today:', data.data.today);
      }
      console.log('[Dashboard] === 数据调试结束 ===');
    }
  }, [data, error]);

  // axios返回格式: { data: { ... }, status: 200, ... }
  // React Query获取的是axios的response对象，需要访问response.data
  // 后端返回格式: { data: { today: {...}, yesterday: {...}, ... } }
  // 所以最终路径是: data.data.data 或 data.data (取决于axios拦截器)
  const stats = data?.data?.data || data?.data || {};

  const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  };

  const getStatCards = () => {
    return [
      {
        title: '今日交易笔数',
        value: stats.today?.totalTransactions || 0,
        icon: FileCheck,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-50',
        change: stats.yesterday ? `+${((stats.today?.totalTransactions - stats.yesterday.totalTransactions) / stats.yesterday.totalTransactions * 100).toFixed(1)}%` : undefined,
        trend: stats.today?.totalTransactions >= (stats.yesterday?.totalTransactions || 0) ? 'up' : 'down',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        help: '今日所有渠道的支付交易总笔数，包括POS、电商、O2O等各业务系统的交易记录。',
      },
      {
        title: '对平笔数',
        value: stats.today?.matchedCount || 0,
        icon: CheckCircle2,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-50',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        help: '今日已成功匹配的业务流水和支付流水数量，表示对账成功的交易笔数。',
      },
      {
        title: '差异笔数',
        value: stats.today?.unmatchedCount || 0,
        icon: AlertTriangle,
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-50',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        help: '今日存在差异的交易笔数，包括长款、短款、金额差异等情况，需要人工处理。',
      },
      {
        title: '交易总金额',
        value: stats.today?.totalAmount || 0,
        icon: DollarSign,
        color: 'from-purple-500 to-pink-500',
        bgColor: 'bg-purple-50',
        subtitle: `对平率 ${(stats.today?.matchRate || 0).toFixed(1)}%`,
        isAmount: true,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        help: '今日所有交易的总金额，包括所有支付渠道的汇总金额。对平率表示已匹配金额占总金额的比例。',
      },
      {
        title: '待处理差异',
        value: stats.pendingTicketsCount || 0,
        icon: Activity,
        color: 'from-red-500 to-rose-500',
        bgColor: 'bg-red-50',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)',
        help: '当前待处理的差异工单数量，需要财务人员审核和处理。',
      },
      {
        title: '处理中差异',
        value: stats.processingTicketsCount || 0,
        icon: TrendingUp,
        color: 'from-yellow-500 to-amber-500',
        bgColor: 'bg-yellow-50',
        gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
        help: '正在处理中的差异工单数量，表示已经有负责人正在跟进处理。',
      },
    ];
  };

  const getTrendData = () => {
    const trend = timeRange === '7d' ? stats.trend7Days : stats.trend30Days;
    if (!trend || trend.length === 0) return [];

    return trend.map((item: any) => ({
      date: format(new Date(item.date), timeRange === '7d' ? 'MM/dd' : 'MM/dd'),
      transactions: item.transactions || 0,
      matched: item.matched || 0,
      amount: (item.amount || 0) / 10000,
    }));
  };

  const getChannelDistribution = () => {
    if (!stats.channelStats || stats.channelStats.length === 0) return [];
    
    const channelMap: { [key: string]: string } = {
      WECHAT: '微信支付',
      ALIPAY: '支付宝',
      BANK_CARD: '银行卡',
      E_CNY: '数字人民币',
    };

    return stats.channelStats.map((stat: any) => ({
      name: channelMap[stat.channel] || stat.channel,
      value: stat.total || 0,
      matched: stat.matched || 0,
      matchRate: stat.matchRate || 0,
      color: stat.channel === 'E_CNY' ? chartColors.success : 
             stat.channel === 'WECHAT' ? chartColors.primary :
             stat.channel === 'ALIPAY' ? chartColors.info : chartColors.secondary,
    })).filter((item: any) => item.value > 0);
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">加载数据失败</p>
          <p className="text-sm text-gray-600">{error instanceof Error ? error.message : '未知错误'}</p>
        </div>
      </div>
    );
  }

  const trendData = getTrendData();
  const channelData = getChannelDistribution();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
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
                  <Network className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
                  <div className="text-primary-100 text-lg flex items-center space-x-2">
                    <span>{format(new Date(), 'yyyy年MM月dd日')}</span>
                    <span>·</span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
                      <span>系统运行正常</span>
                    </span>
                  </div>
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
                <div className="flex items-center space-x-2">
                  {stat.change && (
                    <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                      stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.change}
                    </span>
                  )}
                  <HelpTooltip
                    mode="click"
                    title={stat.title}
                    content={stat.help}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.isAmount ? (
                    stat.value >= 10000 ? (
                      <>
                        ¥<AnimatedNumber
                          value={stat.value / 10000}
                          decimals={1}
                        />万
                      </>
                    ) : (
                      <>
                        ¥<AnimatedNumber
                          value={stat.value}
                          decimals={0}
                        />
                      </>
                    )
                  ) : (
                    <AnimatedNumber value={stat.value} />
                  )}
                </div>
                {stat.subtitle && (
                  <div className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>{stat.subtitle}</span>
                  </div>
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
                  <p className="text-sm text-gray-500">数据变化趋势</p>
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
                    <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorMatched" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
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
                    dataKey="transactions"
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#colorTransactions)"
                    name="交易笔数"
                  />
                  <Area
                    type="monotone"
                    dataKey="matched"
                    stroke={chartColors.success}
                    fillOpacity={1}
                    fill="url(#colorMatched)"
                    name="对平笔数"
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
                <h2 className="text-2xl font-bold gradient-text">渠道分布</h2>
                <p className="text-sm text-gray-500">各支付渠道占比</p>
              </div>
            </div>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
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
