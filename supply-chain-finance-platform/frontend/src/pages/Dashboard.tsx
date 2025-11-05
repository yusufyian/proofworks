import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  FileText, ArrowLeftRight, CreditCard, TrendingUp, DollarSign, Clock, 
  CheckCircle2, Activity, Zap, BarChart3, PieChart, Sparkles, Network
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
      case 'core_enterprise':
        return '核心企业';
      case 'supplier':
        return '供应商';
      case 'bank':
        return '银行';
      default:
        return '用户';
    }
  };

  // 图表颜色配置
  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  };

  const getStatCards = () => {
    if (user?.role === 'core_enterprise') {
      return [
        {
          title: '凭证总数',
          value: stats.totalCertificates || 0,
          icon: FileText,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          change: '+12%',
          trend: 'up',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        },
        {
          title: '有效凭证',
          value: stats.activeCertificates || 0,
          icon: CheckCircle2,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
          title: '总金额',
          value: stats.totalAmount || 0,
          icon: DollarSign,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          subtitle: `平均 ¥${((stats.avgAmount || 0) / 10000).toFixed(1)}万/凭证`,
          isAmount: true,
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        },
        {
          title: '剩余金额',
          value: stats.remainingAmount || 0,
          icon: TrendingUp,
          color: 'from-orange-500 to-amber-500',
          bgColor: 'bg-orange-50',
          subtitle: `利用率 ${stats.utilizationRate || 0}%`,
          isAmount: true,
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        },
      ];
    } else if (user?.role === 'supplier') {
      return [
        {
          title: '我的凭证',
          value: stats.myCertificates || 0,
          icon: FileText,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        },
        {
          title: '可用凭证',
          value: stats.activeCertificates || 0,
          icon: Activity,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
          title: '凭证总额',
          value: stats.totalAmount || 0,
          icon: DollarSign,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          subtitle: `平均 ¥${((stats.avgAmount || 0) / 10000).toFixed(1)}万`,
          isAmount: true,
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        },
        {
          title: '待审批融资',
          value: stats.pendingFinancings || 0,
          icon: CreditCard,
          color: 'from-yellow-500 to-amber-500',
          bgColor: 'bg-yellow-50',
          gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
        },
      ];
    } else if (user?.role === 'bank') {
      return [
        {
          title: '待审批',
          value: stats.pendingFinancings || 0,
          icon: Clock,
          color: 'from-yellow-500 to-amber-500',
          bgColor: 'bg-yellow-50',
          gradient: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
        },
        {
          title: '已批准',
          value: stats.approvedFinancings || 0,
          icon: CheckCircle2,
          color: 'from-green-500 to-emerald-500',
          bgColor: 'bg-green-50',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        {
          title: '已放款',
          value: stats.disbursedFinancings || 0,
          icon: DollarSign,
          color: 'from-blue-500 to-cyan-500',
          bgColor: 'bg-blue-50',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
        },
        {
          title: '放款总额',
          value: stats.totalFinancingAmount || 0,
          icon: TrendingUp,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          subtitle: `平均 ¥${((stats.avgFinancingAmount || 0) / 10000).toFixed(1)}万 | 通过率 ${stats.approvalRate || 0}%`,
          isAmount: true,
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        },
      ];
    }
    return [];
  };

  // 格式化图表数据
  const getTrendData = () => {
    const trend = timeRange === '7d' ? stats.trend7Days : stats.trend30Days;
    if (!trend || trend.length === 0) return [];
    
    return trend.map((item: any) => ({
      date: format(new Date(item.date), timeRange === '7d' ? 'MM/dd' : 'MM/dd'),
      count: item.count || 0,
      amount: (item.amount || 0) / 10000, // 转换为万元
    }));
  };

  // 状态分布数据（饼图）
  const getStatusDistribution = () => {
    if (user?.role === 'core_enterprise' && stats.statusDistribution) {
      return [
        { name: '持有中', value: stats.statusDistribution.holding || 0, color: chartColors.success },
        { name: '已转让', value: stats.statusDistribution.transferred || 0, color: chartColors.primary },
        { name: '已质押', value: stats.statusDistribution.pledged || 0, color: chartColors.warning },
        { name: '已核销', value: stats.statusDistribution.redeemed || 0, color: '#6b7280' },
        { name: '已拆分', value: stats.statusDistribution.split || 0, color: chartColors.secondary },
      ].filter(item => item.value > 0);
    } else if (user?.role === 'supplier' && stats.statusDistribution) {
      return [
        { name: '持有中', value: stats.statusDistribution.holding || 0, color: chartColors.success },
        { name: '已转让', value: stats.statusDistribution.transferred || 0, color: chartColors.primary },
        { name: '已质押', value: stats.statusDistribution.pledged || 0, color: chartColors.warning },
      ].filter(item => item.value > 0);
    } else if (user?.role === 'bank' && stats.financingStatus) {
      return [
        { name: '待审批', value: stats.financingStatus.pending || 0, color: chartColors.warning },
        { name: '已批准', value: stats.financingStatus.approved || 0, color: chartColors.info },
        { name: '已放款', value: stats.financingStatus.disbursed || 0, color: chartColors.success },
        { name: '已拒绝', value: stats.financingStatus.rejected || 0, color: chartColors.danger },
        { name: '已还款', value: stats.financingStatus.repaid || 0, color: '#6b7280' },
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
      {/* 科技感网格背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}></div>

      {/* 欢迎横幅 - 增强科技感 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 text-white shadow-2xl border border-primary-500/20">
        {/* 动态光效 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-400/20 rounded-full -ml-48 -mb-48 blur-3xl"></div>
        
        {/* 网格覆盖 */}
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

      {/* 统计卡片 - 增强科技感 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group relative overflow-hidden border border-gray-200/50 hover:border-primary-300/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
            }}
          >
            {/* 卡片光效 */}
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
                    mode="hover"
                    title={stat.title}
                    content={
                      user?.role === 'core_enterprise'
                        ? stat.title === '凭证总数'
                          ? '您签发的所有数字凭证总数，包括已转让、已质押和已核销的凭证。'
                          : stat.title === '有效凭证'
                          ? '当前状态为"持有中"的凭证数量，这些凭证可以继续流转或融资。'
                          : stat.title === '总金额'
                          ? '所有凭证的初始金额总和，反映了您的总应付款项规模。'
                          : stat.title === '剩余金额'
                          ? '当前可用的凭证金额总和，即未被转让或质押的金额。'
                          : ''
                        : user?.role === 'supplier'
                        ? stat.title === '我的凭证'
                          ? '您从核心企业接收到的所有数字凭证数量。'
                          : stat.title === '可用凭证'
                          ? '状态为"持有中"的凭证，可以进行转让或融资操作。'
                          : stat.title === '凭证总额'
                          ? '您持有的所有凭证的金额总和。'
                          : stat.title === '待审批融资'
                          ? '您提交的、正在等待银行审批的融资申请数量。'
                          : ''
                        : stat.title === '待审批'
                          ? '等待您审批的融资申请数量。'
                          : stat.title === '已批准'
                          ? '您已批准但尚未放款的融资申请数量。'
                          : stat.title === '已放款'
                          ? '已完成放款的融资申请数量。'
                          : stat.title === '放款总额'
                          ? '您已放款的总金额。'
                          : ''
                    }
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
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

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 趋势图表 */}
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
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="count"
                    stroke={chartColors.primary}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="数量"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    stroke={chartColors.secondary}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    name="金额(万元)"
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

        {/* 状态分布饼图 */}
        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">状态分布</h2>
                <p className="text-sm text-gray-500">当前状态占比</p>
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

      {/* 快速操作和公告 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">快速操作</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"></div>
            </div>
            <div className="space-y-3">
              {user?.role === 'core_enterprise' && (
                <a
                  href="/certificates"
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-primary-50 hover:to-primary-100 transition-all duration-200 border border-gray-100 hover:border-primary-200 group"
                >
                  <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-600 transition-colors">
                    <FileText className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">签发新凭证</p>
                    <p className="text-sm text-gray-500">为供应商创建数字凭证</p>
                  </div>
                  <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </a>
              )}
              {user?.role === 'supplier' && (
                <>
                  <a
                    href="/certificates"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">查看我的凭证</p>
                      <p className="text-sm text-gray-500">管理持有的数字凭证</p>
                    </div>
                    <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </a>
                  <a
                    href="/financing"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-green-50 hover:to-green-100 transition-all duration-200 border border-gray-100 hover:border-green-200 group"
                  >
                    <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-600 transition-colors">
                      <CreditCard className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">申请融资</p>
                      <p className="text-sm text-gray-500">使用凭证快速获得资金</p>
                    </div>
                    <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </a>
                  <a
                    href="/transfers"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-purple-50 hover:to-purple-100 transition-all duration-200 border border-gray-100 hover:border-purple-200 group"
                  >
                    <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-colors">
                      <ArrowLeftRight className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">转让凭证</p>
                      <p className="text-sm text-gray-500">将凭证转让给其他供应商</p>
                    </div>
                    <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </a>
                </>
              )}
              {user?.role === 'bank' && (
                <a
                  href="/financing"
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-primary-50 hover:to-primary-100 transition-all duration-200 border border-gray-100 hover:border-primary-200 group"
                >
                  <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-600 transition-colors">
                    <CreditCard className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">审批融资申请</p>
                    <p className="text-sm text-gray-500">查看并处理待审批的融资请求</p>
                  </div>
                  <ArrowLeftRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">系统公告</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-1">平台升级通知</p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      系统将于本周末进行升级维护，预计维护时间2小时，感谢您的理解与支持。
                    </p>
                    <p className="text-xs text-blue-600 mt-2">2025-11-05</p>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">新功能上线</p>
                    <p className="text-sm text-green-700 leading-relaxed">
                      凭证拆分功能已上线，您现在可以将大额凭证拆分为多个小额凭证进行流转。
                    </p>
                    <p className="text-xs text-green-600 mt-2">2025-11-01</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
