import { useState } from 'react';
import { useQuery } from 'react-query';
import { ordersApi } from '../api/orders';
import { Package, CheckCircle2, Clock, Truck } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['orders', statusFilter],
    () => ordersApi.getAll({ status: statusFilter || undefined, limit: 50 })
  );

  const orders = data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; text: string }> = {
      completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', text: '已完成' },
      delivered: { icon: Truck, color: 'bg-blue-100 text-blue-700', text: '已交付' },
      customs_cleared: { icon: CheckCircle2, color: 'bg-purple-100 text-purple-700', text: '已清关' },
      shipped: { icon: Truck, color: 'bg-yellow-100 text-yellow-700', text: '已发货' },
      confirmed: { icon: CheckCircle2, color: 'bg-indigo-100 text-indigo-700', text: '已确认' },
      pending: { icon: Clock, color: 'bg-gray-100 text-gray-700', text: '待确认' },
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
            <Package className="w-8 h-8 mr-3 text-primary-600" />
            供应链协同
          </h1>
          <p className="text-gray-600 mt-1">管理跨境供应链订单</p>
        </div>
        <HelpTooltip
          content="跨境供应链协同包括订单同步、物流追踪、清关状态等全流程。订单数据会自动同步到境外系统，提单等重要单据会上链存证防止重复融资。系统会实时追踪清关状态并推送通知。"
          title="供应链协同"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">订单列表</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="shipped">已发货</option>
            <option value="customs_cleared">已清关</option>
            <option value="delivered">已交付</option>
            <option value="completed">已完成</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">订单编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">买方</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">供应商</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">产品</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数量</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">金额</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">清关状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.buyerCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.supplierCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      ${order.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {order.customsStatus === 'cleared' ? '已清关' : '待清关'}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
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

