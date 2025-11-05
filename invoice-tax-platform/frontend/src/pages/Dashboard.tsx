import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  FileText, Receipt, CreditCard, TrendingUp, DollarSign, Clock, 
  CheckCircle2, AlertTriangle, Activity, BarChart3, PieChart, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  return <>{value.toFixed(decimals)}</>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);

  const stats = data?.data?.data || {};

  const getStatCards = () => {
    return [
      {
        title: '发票总数',
        value: stats.totalInvoices || 0,
        icon: FileText,
        color: 'from-indigo-500 to-indigo-600',
        bgColor: 'bg-indigo-50',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        help: '系统中已上传的所有发票总数，包括已验证和待验证的发票。'
      },
      {
        title: '已验证发票',
        value: stats.verifiedInvoices || 0,
        icon: CheckCircle2,
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        help: '通过税务查验接口验证为真实的发票数量。'
      },
      {
        title: '已匹配发票',
        value: stats.matchedInvoices || 0,
        icon: Activity,
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        help: '完成三单匹配（采购订单+入库单+发票）的发票数量。'
      },
      {
        title: '高风险发票',
        value: stats.highRiskInvoices || 0,
        icon: AlertTriangle,
        color: 'from-red-500 to-red-600',
        bgColor: 'bg-red-50',
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        help: '被风控引擎识别为高风险，需要人工审核的发票数量。'
      },
      {
        title: '报销总额',
        value: stats.totalReimbursementAmount || 0,
        icon: DollarSign,
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        isAmount: true,
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        help: '所有报销申请的总金额。'
      },
      {
        title: '待审批报销',
        value: stats.pendingReimbursements || 0,
        icon: Clock,
        color: 'from-yellow-500 to-yellow-600',
        bgColor: 'bg-yellow-50',
        gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
        help: '正在等待审批的报销申请数量。'
      },
    ];
  };

  const getTrendData = () => {
    const trend = timeRange === '7d' ? stats.trend7Days : stats.trend30Days;
    if (!trend || trend.length === 0) return [];
    
    return trend.map((item: any) => ({
      date: format(new Date(item.date), timeRange === '7d' ? 'MM/dd' : 'MM/dd'),
      invoiceCount: item.invoiceCount || 0,
      invoiceAmount: (item.invoiceAmount || 0) / 10000,
      reimbursementCount: item.reimbursementCount || 0,
      reimbursementAmount: (item.reimbursementAmount || 0) / 10000,
    }));
  };

  const getStatusDistribution = () => {
    if (stats.statusDistribution) {
      return [
        { name: '已验证', value: stats.statusDistribution.verified || 0, color: '#10b981' },
        { name: '待验证', value: stats.statusDistribution.pending || 0, color: '#f59e0b' },
        { name: '无效', value: stats.statusDistribution.invalid || 0, color: '#ef4444' },
        { name: '已匹配', value: stats.statusDistribution.matched || 0, color: '#3b82f6' },
        { name: '未匹配', value: stats.statusDistribution.unmatched || 0, color: '#6b7280' },
      ].filter(item => item.value > 0);
    }
    return [];
  };

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

  const trendData = getTrendData();
  const statusData = getStatusDistribution();

  return (
    <div className="space-y-8 relative">
      <div className="fixed inset-0 pointer-events-none opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
      }}></div>

      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-10 text-white shadow-2xl border border-indigo-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
                  <p className="text-indigo-100 text-lg flex items-center space-x-2">
                    <span>{user?.department || '未分配部门'}</span>
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatCards().map((stat, index) => (
          <div 
            key={index} 
            className="stat-card group relative overflow-hidden border border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
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
                  mode="hover"
                  title={stat.title}
                  content={stat.help}
                />
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card relative overflow-hidden border border-gray-200/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
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
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  7天
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    timeRange === '30d'
                      ? 'bg-white text-indigo-600 shadow-sm'
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
                    <linearGradient id="colorInvoice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
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
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="invoiceCount"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorInvoice)"
                    name="发票数量"
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
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">状态分布</h2>
                <p className="text-sm text-gray-500">发票状态占比</p>
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

