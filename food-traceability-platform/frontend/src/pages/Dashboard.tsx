import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { dashboardApi } from '../api/dashboard';
import { 
  Package, 
  Boxes, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Database,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import HelpTooltip from '../components/HelpTooltip';
import AnimatedNumber from '../components/AnimatedNumber';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await dashboardApi.getStats();
      setStats(result.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Activity className="w-8 h-8 text-primary-600 animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="text-center text-gray-500">数据加载失败</div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: '产品档案总数',
      value: stats.overview.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
      help: '系统内已注册的产品档案总量，涵盖各类食品及农产品品类。'
    },
    {
      title: '批次总量',
      value: stats.overview.totalBatches,
      icon: Boxes,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      help: '系统内所有产品批次的总量，每个批次均具备唯一追溯标识前缀。'
    },
    {
      title: '流转事件总数',
      value: stats.overview.totalEvents,
      icon: Activity,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      help: '产品全链路流转过程中记录的所有事件总量，涵盖生产、运输、仓储、销售等各环节。'
    },
    {
      title: '物联网监测数据',
      value: stats.overview.totalIoTData,
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      help: '来自各类传感器设备的物联网监测数据总量，包括温度、湿度、GPS定位等环境参数。'
    },
    {
      title: '进行中召回事件',
      value: stats.overview.activeRecalls,
      icon: AlertTriangle,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      help: '当前处于执行阶段的产品召回事件数量。'
    },
  ];

  // 准备图表数据
  const batchStatusData = Object.entries(stats.batchStatus || {}).map(([name, value]) => ({
    name,
    value
  }));

  const categoryData = Object.entries(stats.productCategory || {}).map(([name, value]) => ({
    name,
    value
  }));

  const dailyEventsData = Object.entries(stats.dailyEvents || {}).map(([date, count]) => ({
    date: date.split('-').slice(1).join('/'),
    count
  })).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Layout>
      <div className="space-y-8 relative">
        {/* 科技感网格背景 */}
        <div className="fixed inset-0 pointer-events-none opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}></div>

        {/* 欢迎横幅 */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-10 text-white shadow-2xl border border-primary-500/20">
          {/* 动态光效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
          
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
                <h1 className="text-4xl font-bold mb-2">全链路追溯系统总览</h1>
                <p className="text-primary-100 text-lg">Full-Chain Traceability System Overview</p>
              </div>
              <div className="hidden lg:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">实时监控</span>
              </div>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
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
                    background: `radial-gradient(circle, ${card.gradient}, transparent 70%)`,
                    filter: 'blur(40px)',
                  }}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      <Icon className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <HelpTooltip
                      mode="click"
                      title={card.title}
                      content={card.help}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      <AnimatedNumber value={card.value} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 批次状态分布 */}
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">批次状态分布</h2>
                  <p className="text-sm text-gray-500">状态占比统计</p>
                </div>
                <div className="flex-1" />
                <HelpTooltip 
                  mode="click"
                  title="批次状态分布"
                  content="展示系统内所有批次的状态分布情况，包括生产中、合格、不合格、已召回等状态维度。" 
                />
              </div>
            {batchStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={batchStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {batchStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据记录</p>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* 产品类别分布 */}
          <div className="card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">产品类别分布</h2>
                  <p className="text-sm text-gray-500">类别规模统计</p>
                </div>
                <div className="flex-1" />
                <HelpTooltip 
                  mode="click"
                  title="产品类别分布"
                  content="展示不同产品类别的数量分布情况，涵盖水果、蔬菜、肉类、水产、乳制品等品类。" 
                />
              </div>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
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
                  <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据记录</p>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* 每日事件趋势 */}
          <div className="card relative overflow-hidden lg:col-span-2">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">每日事件趋势</h2>
                  <p className="text-sm text-gray-500">近7日活动统计</p>
                </div>
                <div className="flex-1" />
                <HelpTooltip 
                  mode="click"
                  title="每日事件趋势"
                  content="展示近7日流转事件数量变化趋势，便于洞察系统运营活跃度与业务节奏。" 
                />
              </div>
            {dailyEventsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyEventsData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
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
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    name="事件数"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>暂无数据记录</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* 最近批次 */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold gradient-text">最新批次</h2>
                  <p className="text-sm text-gray-500">最近创建的批次信息</p>
              </div>
              <div className="flex-1" />
              <HelpTooltip 
                mode="click"
                title="最近批次"
                  content="展示最近创建的批次信息，包括产品名称、批次号、生产日期和当前状态。"
              />
            </div>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">产品名称</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">批次号</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">生产日期</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">数量</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">状态</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBatches?.map((batch: any) => (
                  <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{batch.productName}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-mono">{batch.batchNumber}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{batch.productionDate}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{batch.quantity} {batch.unit}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === '合格' ? 'bg-green-100 text-green-800' :
                        batch.status === '生产中' ? 'bg-blue-100 text-blue-800' :
                        batch.status === '已召回' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

