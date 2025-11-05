import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { certificatesApi, Certificate } from '../api/certificates';
import { useAuthStore } from '../store/authStore';
import { FileText, Plus, Search, CheckCircle2, Clock, Lock, Split, TrendingUp, X } from 'lucide-react';
import { format } from 'date-fns';
import CreateCertificateModal from '../components/CreateCertificateModal';
import HelpTooltip from '../components/HelpTooltip';

const statusMap = {
  holding: { label: '持有中', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  transferred: { label: '已转让', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp },
  pledged: { label: '已质押', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Lock },
  redeemed: { label: '已核销', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle2 },
  split: { label: '已拆分', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Split },
};

export default function Certificates() {
  const navigate = useNavigate();
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
    ['certificates', page, statusFilter, debouncedSearch],
    () => certificatesApi.getAll({ 
      page, 
      limit: 10, 
      status: statusFilter || undefined,
      search: debouncedSearch || undefined
    })
  );

  const certificates = data?.data?.certificates || [];
  const pagination = data?.data?.pagination || { total: 0, pages: 1 };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold gradient-text mb-2">凭证管理</h1>
              <HelpTooltip
                mode="click"
                title="凭证管理"
                content={
                  user?.role === 'core_enterprise'
                    ? '作为核心企业，您可以在这里签发数字凭证给供应商。数字凭证是您对应付款项的数字化承诺，可以在供应链中流转，帮助供应商解决资金问题。'
                    : '作为供应商，您可以在这里查看从核心企业接收的数字凭证。凭证可以用于融资或转让给其他供应商，帮助您灵活管理资金流。'
                }
              />
            </div>
            <p className="text-gray-600 text-lg">管理您的数字凭证，查看流转历史</p>
          </div>
        </div>
        {user?.role === 'core_enterprise' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>签发凭证</span>
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
              placeholder="搜索凭证编号、公司名称..."
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

      {/* 凭证列表 */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">暂无凭证</p>
            {user?.role === 'core_enterprise' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 btn-primary"
              >
                签发第一个凭证
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">凭证编号</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">
                    {user?.role === 'core_enterprise' ? '债务人' : '债权人'}
                  </th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">初始金额</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">剩余金额</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">到期日</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span>状态</span>
                      <HelpTooltip
                        mode="hover"
                        title="凭证状态说明"
                        content="持有中：凭证可正常使用，可转让或融资\n已转让：凭证已转让给其他供应商\n已质押：凭证已用于融资申请\n已核销：凭证已到期或被核心企业核销\n已拆分：凭证已被拆分为多个小额凭证"
                      />
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700 uppercase text-sm tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert: Certificate) => {
                  const StatusIcon = statusMap[cert.status]?.icon || FileText;
                  return (
                    <tr key={cert.id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200">
                      <td className="py-5 px-6">
                        <div className="font-bold text-gray-900">{cert.certificateNumber}</div>
                        {cert.blockchainTxHash && (
                          <div className="text-xs text-gray-500 mt-1 font-mono truncate max-w-xs">
                            {cert.blockchainTxHash.substring(0, 20)}...
                          </div>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <div className="font-medium text-gray-900">
                          {user?.role === 'core_enterprise'
                            ? cert.debtor?.name
                            : cert.creditor?.name}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="font-bold text-gray-900 text-lg">
                          ¥{cert.initialAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className={`font-semibold ${
                          cert.remainingAmount === cert.initialAmount ? 'text-gray-900' : 'text-primary-600'
                        }`}>
                          ¥{cert.remainingAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="text-gray-900 font-medium">
                          {format(new Date(cert.expiryDate), 'yyyy-MM-dd')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.ceil((new Date(cert.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} 天后到期
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                            statusMap[cert.status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusMap[cert.status]?.label || cert.status}</span>
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button
                          onClick={() => navigate(`/certificates/${cert.id}`)}
                          className="text-primary-600 hover:text-primary-700 font-semibold transition-colors hover:underline"
                        >
                          查看详情
                        </button>
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

      {showCreateModal && (
        <CreateCertificateModal
          onClose={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('certificates');
          }}
        />
      )}
    </div>
  );
}
