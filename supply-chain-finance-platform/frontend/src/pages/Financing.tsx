import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { financingApi, Financing } from '../api/financing';
import { useAuthStore } from '../store/authStore';
import { CreditCard, Plus, Search, CheckCircle2, XCircle, Clock, DollarSign, X } from 'lucide-react';
import CreateFinancingModal from '../components/CreateFinancingModal';
import HelpTooltip from '../components/HelpTooltip';

const statusMap = {
  pending: { label: '待审批', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  approved: { label: '已批准', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
  disbursed: { label: '已放款', color: 'bg-green-100 text-green-800 border-green-200', icon: DollarSign },
  repaid: { label: '已还款', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle2 },
  overdue: { label: '已逾期', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

export default function FinancingPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading } = useQuery(
    ['financing', page, statusFilter, debouncedSearch],
    () => financingApi.getAll({ 
      page, 
      limit: 10, 
      status: statusFilter || undefined,
      search: debouncedSearch || undefined
    })
  );

  const financings = data?.data?.financings || [];
  const pagination = data?.data?.pagination || { total: 0, pages: 1 };

  const approveMutation = useMutation(
    (id: string) => financingApi.approve(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('financing');
      },
    }
  );

  const rejectMutation = useMutation(
    ({ id, reason }: { id: string; reason?: string }) => financingApi.reject(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('financing');
      },
    }
  );

  const disburseMutation = useMutation(
    (id: string) => financingApi.disburse(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('financing');
      },
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold gradient-text mb-2">融资管理</h1>
              <HelpTooltip
                mode="click"
                title="融资管理"
                content={
                  user?.role === 'supplier'
                    ? '您可以在这里申请融资，使用持有的数字凭证作为质押物向银行申请资金。融资申请需要选择凭证、银行、金额和期限。银行审批通过后即可获得资金。'
                    : '作为银行，您可以在这里审批供应商提交的融资申请。审批时会评估凭证的真实性、供应商的信用状况等因素。批准后可以进行放款操作。'
                }
              />
            </div>
            <p className="text-gray-600 text-lg">管理融资申请和审批流程</p>
          </div>
        </div>
        {user?.role === 'supplier' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>申请融资</span>
          </button>
        )}
      </div>

      {/* 筛选器 */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索融资记录..."
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

      {/* 融资列表 */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : financings.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <CreditCard className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">暂无融资记录</p>
            {user?.role === 'supplier' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 btn-primary"
              >
                申请第一笔融资
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">凭证编号</th>
                  {user?.role === 'supplier' && (
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">融资方</th>
                  )}
                  {user?.role === 'bank' && (
                    <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">申请人</th>
                  )}
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">融资金额</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">利率</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">期限（天）</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">风控评级</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">状态</th>
                  {user?.role === 'bank' && (
                    <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {financings.map((financing: Financing) => {
                  const StatusIcon = statusMap[financing.status]?.icon || Clock;
                  return (
                    <tr key={financing.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200">
                      <td className="py-5 px-6">
                        <div className="font-bold text-gray-900">
                          {financing.certificate?.certificateNumber || '-'}
                        </div>
                      </td>
                      {user?.role === 'supplier' && (
                        <td className="py-5 px-6">
                          <div className="font-medium text-gray-900">
                            {financing.financier?.name || '-'}
                          </div>
                        </td>
                      )}
                      {user?.role === 'bank' && (
                        <td className="py-5 px-6">
                          <div className="font-medium text-gray-900">
                            {financing.applicant?.name || '-'}
                          </div>
                        </td>
                      )}
                      <td className="py-5 px-6 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          ¥{financing.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-semibold text-primary-600">
                          {financing.interestRate}%
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-gray-900 font-medium">{financing.term}</span>
                      </td>
                      <td className="py-5 px-6">
                        {financing.riskRating && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-2 border-purple-300">
                            {financing.riskRating}
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                            statusMap[financing.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusMap[financing.status]?.label || financing.status}</span>
                        </span>
                      </td>
                      {user?.role === 'bank' && financing.status === 'pending' && (
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => approveMutation.mutate(financing.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              批准
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate({ id: financing.id })}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all shadow-md hover:shadow-lg"
                            >
                              拒绝
                            </button>
                          </div>
                        </td>
                      )}
                      {user?.role === 'bank' && financing.status === 'approved' && (
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={() => disburseMutation.mutate(financing.id)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-all shadow-md hover:shadow-lg"
                          >
                            放款
                          </button>
                        </td>
                      )}
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

      {showCreateModal && (
        <CreateFinancingModal
          onClose={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('financing');
          }}
        />
      )}
    </div>
  );
}
