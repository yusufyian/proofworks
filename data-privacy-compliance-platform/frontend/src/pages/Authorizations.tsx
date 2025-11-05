import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authorizationApi } from '../api/authorizations';
import { Shield, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function Authorizations() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ['authorizations', page, status],
    () => authorizationApi.getAuthorizations({ page, limit: 20, status })
  );

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: string; status: string }) => authorizationApi.updateAuthorizationStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['authorizations']);
      },
    }
  );

  const authorizations = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: '待审批' },
      approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: '已批准' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: '已拒绝' },
      expired: { icon: AlertCircle, color: 'bg-gray-100 text-gray-700', label: '已过期' },
      revoked: { icon: XCircle, color: 'bg-red-100 text-red-700', label: '已撤销' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span>授权管理</span>
            <HelpTooltip 
              title="授权管理" 
              content="授权管理页面展示所有数据使用授权记录。数据提供方可以创建和审批授权，数据需求方可以查看自己获得的授权。授权通过后会自动上链存证。"
              mode="click"
            />
          </h1>
          <p className="text-gray-600 mt-2">管理和审批数据使用授权</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已批准</option>
            <option value="rejected">已拒绝</option>
            <option value="expired">已过期</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {authorizations.map((auth: any) => {
                const statusBadge = getStatusBadge(auth.status);
                const StatusIcon = statusBadge.icon;
                return (
                  <div key={auth.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusBadge.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusBadge.label}</span>
                          </span>
                          {auth.blockchainHash && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              已上链
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">用途:</span> {auth.purpose}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">数据范围:</span> {auth.dataScope}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 mt-3">
                          <span>授权方: {auth.grantorName} ({auth.grantorOrg})</span>
                          <span>被授权方: {auth.granteeName} ({auth.granteeOrg})</span>
                          <span>有效期至: {format(new Date(auth.validTo), 'yyyy-MM-dd')}</span>
                        </div>
                      </div>
                      {auth.status === 'pending' && (
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: auth.id, status: 'approved' })}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            批准
                          </button>
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: auth.id, status: 'rejected' })}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            拒绝
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {total > 20 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">共 {total} 条记录</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-sm">第 {page} 页</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
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

