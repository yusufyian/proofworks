import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { transfersApi, Transfer } from '../api/transfers';
import { ArrowLeftRight, Search, CheckCircle2, XCircle, Clock, Split, X } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

const statusMap = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

export default function Transfers() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // 防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery(
    ['transfers', page, statusFilter, debouncedSearch],
    () => transfersApi.getAll({ 
      page, 
      limit: 10, 
      status: statusFilter || undefined,
      search: debouncedSearch || undefined
    })
  );

  const transfers = data?.data?.transfers || [];
  const pagination = data?.data?.pagination || { total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-4xl font-bold gradient-text mb-2">转让记录</h1>
            <HelpTooltip
              mode="click"
              title="凭证转让"
              content="凭证转让功能允许您将持有的数字凭证转让给其他供应商。转让可以全额转让或部分转让（拆分）。转让后，您失去该部分凭证的所有权，受让方获得相应的权益。转让操作会记录在区块链上，确保可追溯性。"
            />
          </div>
          <p className="text-gray-600 text-lg">查看凭证转让历史与流转轨迹</p>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索转让记录..."
              className="input pl-12 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-48"
          >
            <option value="">全部状态</option>
            {Object.entries(statusMap).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 转让列表 */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <ArrowLeftRight className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">暂无转让记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">凭证编号</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">转让方</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">受让方</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">金额</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">类型</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">状态</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">时间</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer: Transfer) => {
                  const StatusIcon = statusMap[transfer.status]?.icon || Clock;
                  return (
                    <tr key={transfer.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200">
                      <td className="py-5 px-6">
                        <div className="font-bold text-gray-900">
                          {transfer.certificate?.certificateNumber || '-'}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-medium text-gray-900">
                          {transfer.fromCompany?.name || '-'}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-medium text-gray-900">
                          {transfer.toCompany?.name || '-'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          ¥{transfer.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          transfer.transferType === 'full' 
                            ? 'bg-blue-100 text-blue-800 border-2 border-blue-200' 
                            : 'bg-purple-100 text-purple-800 border-2 border-purple-200'
                        }`}>
                          {transfer.transferType === 'full' ? (
                            <>
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>全额转让</span>
                            </>
                          ) : (
                            <>
                              <Split className="w-3.5 h-3.5" />
                              <span>拆分转让</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                            statusMap[transfer.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusMap[transfer.status]?.label || transfer.status}</span>
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm text-gray-600 font-medium">
                        {format(new Date(transfer.createdAt || ''), 'yyyy-MM-dd HH:mm')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* 分页 */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-gray-200">
                <div className="text-sm text-gray-600 font-medium">
                  共 <span className="text-primary-600 font-bold">{pagination.total}</span> 条记录
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition-all"
                  >
                    上一页
                  </button>
                  <span className="px-5 py-2.5 text-sm text-gray-700 font-semibold bg-gray-50 rounded-xl">
                    第 {page} / {pagination.pages} 页
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium transition-all"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
