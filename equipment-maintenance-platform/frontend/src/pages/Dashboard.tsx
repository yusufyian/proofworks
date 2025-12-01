import { useQuery } from 'react-query';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  Cpu, Wrench, Package, Activity, 
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  PieChart as RechartsPieChart, 
  Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';

function AnimatedNumber({ value }: { value: number }) {
  return <span>{value.toLocaleString()}</span>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery('dashboard-stats', async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  });

  const stats = data || {};

  const getStatCards = () => [
    {
      title: '设备总数',
      value: stats.equipment?.total || 0,
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
      help: '系统中管理的所有设备总数，包括正常、维修、待维保等状态的设备。',
    },
    {
      title: '待处理工单',
      value: stats.workOrders?.pending || 0,
      icon: Wrench,
      color: 'from-orange-500 to-red-500',
      help: '当前处于待分配或处理中的维修工单数量。',
    },
    {
      title: '超期维保',
      value: stats.maintenance?.overdue || 0,
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
      help: '已经超过计划维保日期但尚未完成的维保计划数量。',
    },
    {
      title: '平均健康度',
      value: stats.equipment?.avgHealthScore || 0,
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      unit: '分',
      help: '所有设备的平均健康度评分，范围0-100分，分数越高表示设备状态越好。',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const healthData = stats.health ? [
    { name: '优秀', value: stats.health.excellent || 0 },
    { name: '良好', value: stats.health.good || 0 },
    { name: '一般', value: stats.health.fair || 0 },
    { name: '差', value: stats.health.poor || 0 },
  ] : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 rounded-3xl p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-1">欢迎回来，{user?.name}</h1>
              <p className="text-blue-100 text-lg">{format(new Date(), 'yyyy年MM月dd日')}</p>
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
                  content={stat.help}
                  title={stat.title}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">
                  <AnimatedNumber value={stat.value} />{stat.unit || ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">设备状态</h3>
            <HelpTooltip content="设备的实时状态分布情况，包括正常、维修、待维保、报废等状态。" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">正常</span>
              <span className="font-semibold text-green-600">{stats.equipment?.byStatus?.normal || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">维修中</span>
              <span className="font-semibold text-orange-600">{stats.equipment?.byStatus?.repair || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">待维保</span>
              <span className="font-semibold text-yellow-600">{stats.equipment?.byStatus?.maintenance || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">已报废</span>
              <span className="font-semibold text-red-600">{stats.equipment?.byStatus?.scrapped || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">工单统计</h3>
            <HelpTooltip content="维修工单的统计信息，包括待处理、进行中、已完成等状态的工单数量。" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">待处理</span>
              <span className="font-semibold text-orange-600">{stats.workOrders?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">进行中</span>
              <span className="font-semibold text-blue-600">{stats.workOrders?.inProgress || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">已完成</span>
              <span className="font-semibold text-green-600">{stats.workOrders?.completed || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">今日完成</span>
              <span className="font-semibold text-purple-600">{stats.workOrders?.todayCompleted || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">维保计划</h3>
            <HelpTooltip content="维保计划的统计信息，包括已计划、超期、即将到期等。" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">已计划</span>
              <span className="font-semibold text-blue-600">{stats.maintenance?.scheduled || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">超期</span>
              <span className="font-semibold text-red-600">{stats.maintenance?.overdue || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">7天内到期</span>
              <span className="font-semibold text-yellow-600">{stats.maintenance?.dueIn7Days || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">总计划数</span>
              <span className="font-semibold text-gray-900">{stats.maintenance?.total || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 健康度分布饼图 */}
        <div className="card relative overflow-hidden">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold gradient-text">设备健康度分布</h2>
            </div>
            <HelpTooltip content="设备健康度评分分布情况，分为优秀(90+)、良好(70-89)、一般(50-69)、差(<50)四个等级。" />
          </div>
          {healthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {healthData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

        {/* 备件统计 */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold gradient-text">备件管理</h2>
            </div>
            <HelpTooltip content="备件库存的统计信息，包括总数量、低库存预警、库存总价值等。" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <span className="text-gray-700 font-medium">备件总数</span>
              <span className="text-2xl font-bold text-blue-600">{stats.spareParts?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
              <span className="text-gray-700 font-medium">低库存预警</span>
              <span className="text-2xl font-bold text-red-600">{stats.spareParts?.lowStock || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <span className="text-gray-700 font-medium">库存总价值</span>
              <span className="text-2xl font-bold text-green-600">
                ¥{(stats.spareParts?.totalValue || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}