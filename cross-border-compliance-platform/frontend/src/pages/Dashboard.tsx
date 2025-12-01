import { useQuery } from 'react-query';
import { dashboardApi } from '../api/dashboard';
import { 
  FileCheck, FileText, ArrowLeftRight, CreditCard, Package, 
  FileBarChart, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Dashboard() {
  const { data, isLoading } = useQuery('dashboard-stats', dashboardApi.getStats);

  const stats = data?.data || {};

  const statCards = [
    {
      title: '数据出境评估',
      value: stats.assessments?.total || 0,
      subtitle: `已批准 ${stats.assessments?.approved || 0}`,
      icon: FileCheck,
      color: 'from-blue-500 to-cyan-500',
      help: '数据出境评估包括安全评估、标准合同和个人信息保护认证三种路径。已批准数量表示通过合规审批的评估记录数。',
    },
    {
      title: '标准合同',
      value: stats.contracts?.total || 0,
      subtitle: `生效中 ${stats.contracts?.active || 0}`,
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      help: '标准合同是指按照《个人信息出境标准合同办法》签署的合规合同。生效中表示当前有效的合同数量。',
    },
    {
      title: '跨境传输',
      value: stats.transmissions?.total || 0,
      subtitle: `已完成 ${stats.transmissions?.completed || 0}`,
      icon: ArrowLeftRight,
      color: 'from-purple-500 to-pink-500',
      help: '跨境数据传输记录包括所有通过API网关传输到境外的数据操作。系统会自动进行数据脱敏和加密处理。',
    },
    {
      title: '跨境支付',
      value: stats.payments?.completed || 0,
      subtitle: `总金额 ¥${((stats.payments?.amount || 0) / 10000).toFixed(1)}万`,
      icon: CreditCard,
      color: 'from-orange-500 to-amber-500',
      help: '跨境支付记录包括所有通过SWIFT、香港银行等渠道的跨境付款。所有支付均需满足贸易真实性要求。',
    },
    {
      title: '供应链订单',
      value: stats.orders?.total || 0,
      subtitle: `已完成 ${stats.orders?.completed || 0}`,
      icon: Package,
      color: 'from-indigo-500 to-blue-500',
      help: '跨境供应链订单包括采购、物流、清关等全流程。订单信息会同步到境外系统，提单等重要单据会上链存证。',
    },
    {
      title: '监管报送',
      value: stats.reports?.total || 0,
      subtitle: `已提交 ${stats.reports?.submitted || 0}`,
      icon: FileBarChart,
      color: 'from-red-500 to-rose-500',
      help: '监管报送包括向网信办、海关、外管局等主管部门的定期报告和事件报告。所有报送记录均上链存证。',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600 mt-1">跨境合规协作平台概览</p>
        </div>
        <div className="text-sm text-gray-500">
          更新时间: {format(new Date(), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`stat-card bg-gradient-to-br ${card.color} text-white relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <HelpTooltip
                  content={card.help}
                  title={card.title}
                  className="text-white/80 hover:text-white"
                />
              </div>
              <div className="text-3xl font-bold mb-1">{card.value.toLocaleString()}</div>
              <div className="text-sm text-white/80">{card.title}</div>
              <div className="text-xs text-white/70 mt-1">{card.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
            合规概览
            <HelpTooltip
              content="展示各类业务的合规状态统计，包括通过率、待处理事项等关键指标。"
              title="合规概览"
              className="ml-2"
            />
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <span className="text-gray-700">数据出境合规率</span>
              <span className="text-2xl font-bold text-green-600">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <span className="text-gray-700">跨境支付合规率</span>
              <span className="text-2xl font-bold text-blue-600">100%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <span className="text-gray-700">监管报送及时率</span>
              <span className="text-2xl font-bold text-purple-600">100%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-primary-500 mr-2" />
            待处理事项
            <HelpTooltip
              content="显示需要关注和处理的关键事项，包括待审批的评估、待签署的合同等。"
              title="待处理事项"
              className="ml-2"
            />
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-gray-700">待审批评估</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600">
                {stats.assessments?.pending || 0} 项
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">待处理传输</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {stats.transmissions?.pending || 0} 项
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-700">待完成支付</span>
              </div>
              <span className="text-sm font-semibold text-orange-600">
                {stats.payments?.pending || 0} 项
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

