import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { discrepancyApi } from '../api/discrepancy';
import { format } from 'date-fns';
import { AlertTriangle, Search, CheckCircle2, XCircle, Clock, Edit } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Discrepancy() {
  const queryClient = useQueryClient();
  const [type, setType] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: statsData } = useQuery('discrepancy-stats', discrepancyApi.getStats);
  const { data: ticketsData, isLoading } = useQuery(
    ['discrepancy-tickets', type, status, page],
    () => discrepancyApi.getTickets({ type, status, page, pageSize: 20 })
  );

  const updateMutation = useMutation(
    ({ id, updates }: { id: string; updates: any }) => discrepancyApi.updateTicket(id, updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['discrepancy-tickets']);
        queryClient.invalidateQueries(['discrepancy-stats']);
        queryClient.invalidateQueries(['dashboard-stats']);
      },
    }
  );

  // 修复数据访问路径：尝试 data.data.data 或 data.data
  const stats = statsData?.data?.data || statsData?.data || {};
  const tickets = ticketsData?.data?.data?.tickets || ticketsData?.data?.tickets || [];
  const pagination = ticketsData?.data?.data || ticketsData?.data || {};

  const getTypeLabel = (type: string) => {
    const map: { [key: string]: string } = {
      LONG_AMOUNT: '长款',
      SHORT_AMOUNT: '短款',
      AMOUNT_DIFF: '金额差异',
      TIME_DIFF: '时间差异',
      NOT_FOUND: '未找到',
    };
    return map[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            待处理
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Edit className="w-3 h-3 mr-1" />
            处理中
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            已解决
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="w-3 h-3 mr-1" />
            已关闭
          </span>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateMutation.mutate({
      id: ticketId,
      updates: { status: newStatus },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8" />
            <span>差异处理</span>
          </h1>
          <p className="text-gray-600 mt-2">管理和处理对账差异工单</p>
        </div>
        <HelpTooltip
          mode="click"
          title="差异处理"
          content="差异处理用于管理对账过程中发现的差异工单。差异类型包括：长款（支付有记录但业务无记录）、短款（业务有记录但支付无记录）、金额差异、时间差异等。您可以查看差异详情，更新处理状态，并记录处理结果。"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">总差异数</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">待处理</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">处理中</p>
          <p className="text-3xl font-bold text-blue-600">{stats.processing || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">已解决</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">差异总额</p>
          <p className="text-3xl font-bold text-purple-600">
            ¥{((stats.totalAmount || 0) / 10000).toFixed(1)}万
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">差异工单</h2>
          <div className="flex items-center space-x-2">
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">全部类型</option>
              <option value="LONG_AMOUNT">长款</option>
              <option value="SHORT_AMOUNT">短款</option>
              <option value="AMOUNT_DIFF">金额差异</option>
              <option value="TIME_DIFF">时间差异</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">全部状态</option>
              <option value="PENDING">待处理</option>
              <option value="PROCESSING">处理中</option>
              <option value="RESOLVED">已解决</option>
              <option value="CLOSED">已关闭</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无差异工单</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">工单号</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">差异类型</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">差异金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">创建时间</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: any) => (
                    <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{ticket.ticketId}</td>
                      <td className="py-3 px-4 text-sm">{getTypeLabel(ticket.type)}</td>
                      <td className="py-3 px-4 text-sm font-medium">¥{ticket.amount?.toFixed(2) || '0.00'}</td>
                      <td className="py-3 px-4 text-sm text-red-600">
                        {ticket.diffAmount ? `¥${ticket.diffAmount.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(ticket.status)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(ticket.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </td>
                      <td className="py-3 px-4">
                        {ticket.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'PROCESSING')}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            开始处理
                          </button>
                        )}
                        {ticket.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'RESOLVED')}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            标记已解决
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

