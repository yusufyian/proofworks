import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Wrench } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function WorkOrders() {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useQuery(
    ['work-orders', statusFilter, priorityFilter],
    async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      const res = await api.get('/work-orders', { params });
      return res.data;
    }
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'bg-gray-100 text-gray-800', text: '待处理' },
      assigned: { color: 'bg-blue-100 text-blue-800', text: '已分配' },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', text: '进行中' },
      completed: { color: 'bg-green-100 text-green-800', text: '已完成' },
      cancelled: { color: 'bg-red-100 text-red-800', text: '已取消' },
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { color: string; text: string }> = {
      urgent: { color: 'bg-red-500 text-white', text: '紧急' },
      important: { color: 'bg-orange-500 text-white', text: '重要' },
      normal: { color: 'bg-blue-500 text-white', text: '一般' },
      low: { color: 'bg-gray-500 text-white', text: '低' },
    };
    const config = priorityMap[priority] || { color: 'bg-gray-500 text-white', text: priority };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">维修工单</h1>
          <p className="text-gray-600">设备维修工单管理与跟踪</p>
        </div>
        <div className="flex items-center space-x-3">
          <HelpTooltip
            content="维修工单系统用于管理设备的故障报修和维修流程。操作工可以通过扫描设备二维码快速报修，系统会自动分配维修任务。维修完成后，维修记录会自动上链存证，确保数据的真实性和可追溯性。"
            title="维修工单管理"
          />
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="assigned">已分配</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
          </select>
          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">全部优先级</option>
            <option value="urgent">紧急</option>
            <option value="important">重要</option>
            <option value="normal">一般</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      {/* 工单列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.orders || []).map((order: any) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{order.orderNo}</h3>
                    {getPriorityBadge(order.priority)}
                  </div>
                  <p className="text-sm text-gray-600">{order.equipmentName} ({order.equipmentNo})</p>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              {order.faultDescription && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{order.faultDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">报修时间:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(order.reportedAt), 'yyyy-MM-dd HH:mm')}
                  </span>
                </div>
                {order.endTime && (
                  <div>
                    <span className="text-gray-600">完成时间:</span>
                    <span className="ml-2 font-medium">
                      {format(new Date(order.endTime), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                )}
                {order.downtimeHours && (
                  <div>
                    <span className="text-gray-600">停机时长:</span>
                    <span className="ml-2 font-medium text-red-600">
                      {order.downtimeHours} 小时
                    </span>
                  </div>
                )}
              </div>

              {order.blockchainHash && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-blue-600">✓ 维修记录已上链存证</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.orders || data.orders.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>暂无工单数据</p>
        </div>
      )}
    </div>
  );
}