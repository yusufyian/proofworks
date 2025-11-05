import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { reimbursementApi } from '../api/reimbursements';
import { Receipt, Search, Plus, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function Reimbursements() {
  const [search, setSearch] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['reimbursements', search, approvalStatus, page],
    () => reimbursementApi.getList({ search, approvalStatus, page, limit: 20 })
  );

  const reimbursements = data?.data?.data || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string; icon: any }> = {
      pending: { text: '待审批', className: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { text: '已批准', className: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      rejected: { text: '已拒绝', className: 'bg-red-100 text-red-700', icon: XCircle },
    };
    return badges[status] || { text: status, className: 'bg-gray-100 text-gray-700', icon: Receipt };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">费用报销</h1>
          <p className="text-gray-600">提交和管理费用报销申请</p>
        </div>
        <Link
          to="/reimbursements/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>新建报销</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索报销单号、申请人..."
              className="input pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-48"
            value={approvalStatus}
            onChange={(e) => setApprovalStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : reimbursements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Receipt className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无报销数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">报销单号</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">申请人</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">部门</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">费用类型</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">申请时间</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">审批状态</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reimbursements.map((reimbursement: any) => {
                    const statusBadge = getStatusBadge(reimbursement.approvalStatus);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <tr key={reimbursement.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium">{reimbursement.reimbursementNo}</td>
                        <td className="py-4 px-4">{reimbursement.applicantName}</td>
                        <td className="py-4 px-4">{reimbursement.department}</td>
                        <td className="py-4 px-4">
                          {reimbursement.expenseType === 'travel' ? '差旅费' :
                           reimbursement.expenseType === 'meals' ? '餐费' :
                           reimbursement.expenseType === 'office' ? '办公费' :
                           reimbursement.expenseType === 'entertainment' ? '招待费' : '其他'}
                        </td>
                        <td className="py-4 px-4 font-semibold">¥{(reimbursement.totalAmount || 0).toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-600">
                          {reimbursement.createdAt ? format(new Date(reimbursement.createdAt), 'yyyy-MM-dd') : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 w-fit ${statusBadge.className}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusBadge.text}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/reimbursements/${reimbursement.id}`}
                            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>查看</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  共 {pagination.total} 条记录，第 {page} / {pagination.totalPages} 页
                </div>
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

