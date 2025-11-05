import { useState } from 'react';
import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { useAuthStore } from '../store/authStore';
import { 
  Database, Shield, Cpu, FileCheck, Link2, TrendingUp, Activity,
  CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, 
  Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import HelpTooltip from '../components/HelpTooltip';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);
  const stats = data?.data || {};

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'data_provider':
        return '数据提供方';
      case 'data_consumer':
        return '数据需求方';
      case 'admin':
        return '管理员';
      default:
        return '用户';
    }
  };

  const chartColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  const getStatCards = () => {
    return [
      {
        title: '数据资产',
        value: stats.totalDataAssets || 0,
        icon: Database,
        color: 'from-indigo-500 to-blue-500',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
        help: '系统中所有已注册的数据资产总数，包括用户行为数据、交易数据、征信数据等各类数据资产。',
      },
      {
        title: '授权记录',
        value: stats.totalAuthorizations || 0,
        icon: Shield,
        color: 'from-purple-500 to-pink-500',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        help: '数据使用授权记录总数，包括待审批、已批准、已拒绝等状态的授权申请。',
      },
      {
        title: '活跃授权',
        value: stats.activeAuthorizations || 0,
        icon: CheckCircle2,
        color: 'from-green-500 to-emerald-500',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        help: '当前有效的授权记录数量，即状态为"已批准"且在有效期内的授权。',
      },
      {
        title: '计算任务',
        value: stats.totalComputingTasks || 0,
        icon: Cpu,
        color: 'from-orange-500 to-amber-500',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        help: '隐私计算任务总数，包括MPC、TEE、联邦学习等各类隐私计算任务。',
      },
      {
        title: '已完成任务',
        value: stats.completedTasks || 0,
        icon: Activity,
        color: 'from-cyan-500 to-teal-500',
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
        help: '已完成的计算任务数量，这些任务已生成计算结果并完成区块链存证。',
      },
      {
        title: '合规率',
        value: stats.complianceRate || 100,
        icon: FileCheck,
        color: 'from-emerald-500 to-green-500',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        suffix: '%',
        help: '系统合规率，表示所有授权记录中已批准且符合合规要求的比例。',
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 rounded-3xl p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">欢迎回来，{user?.name}</h1>
          <p className="text-indigo-100 text-lg">
            {getRoleLabel()} · {format(new Date(), 'yyyy年MM月dd日')} · 系统运行正常
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getStatCards().map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <HelpTooltip title={stat.title} content={stat.help} mode="click" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
            <p className="text-3xl font-bold text-gray-900">
              {stat.value}{stat.suffix || ''}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>最近活动</span>
          </h2>
          <div className="space-y-4">
            {(stats.recentActivities || []).slice(0, 10).map((activity: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                  <p className="text-xs text-gray-500">{activity.details?.description || activity.action}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
            <Link2 className="w-6 h-6 text-purple-600" />
            <span>区块链存证</span>
            <HelpTooltip 
              title="区块链存证" 
              content="所有数据使用授权和隐私计算任务的结果都会自动上链存证，确保数据使用的可追溯性和不可篡改性。"
              mode="click"
            />
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">存证总数</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">
                  {stats.totalBlockchainRecords || 0}
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-indigo-600 opacity-50" />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                所有授权和计算任务的关键信息都已上链存证，确保数据的完整性和可审计性。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

