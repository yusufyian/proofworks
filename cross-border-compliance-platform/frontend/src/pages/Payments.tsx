import { useState } from 'react';
import { useQuery } from 'react-query';
import { paymentsApi } from '../api/payments';
import { CreditCard, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Payments() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['payments', statusFilter],
    () => paymentsApi.getAll({ status: statusFilter || undefined, limit: 50 })
  );

  const payments = data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; text: string }> = {
      completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', text: '已完成' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: '待处理' },
      processing: { icon: Clock, color: 'bg-blue-100 text-blue-700', text: '处理中' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', text: '已拒绝' },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
        <s.icon className="w-4 h-4" />
        <span>{s.text}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CreditCard className="w-8 h-8 mr-3 text-primary-600" />
            跨境支付
          </h1>
          <p className="text-gray-600 mt-1">管理跨境支付记录</p>
        </div>
        <HelpTooltip
          content="跨境支付需要通过银行审核贸易真实性（合同、报关单、提单等），大额交易（≥20万美元）需上报外管局。支持的支付渠道包括SWIFT、香港银行账户、e-CNY跨境试点等。所有支付记录均上链存证。"
          title="跨境支付"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">支付记录</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部状态</option>
            <option value="completed">已完成</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">支付编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">付款方</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">收款方</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">渠道</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">贸易背景</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.paymentNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.payerCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.payeeCompany}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${payment.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.channel}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.tradeBackground}</td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

