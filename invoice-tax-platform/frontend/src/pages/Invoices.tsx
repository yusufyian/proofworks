import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../api/invoices';
import { FileText, Search, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function Invoices() {
  const [search, setSearch] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['invoices', search, verifyStatus, riskLevel, page],
    () => invoiceApi.getList({ search, verifyStatus, riskLevel, page, limit: 20 })
  );

  const invoices = data?.data?.data || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      verified: { text: '已验证', className: 'bg-green-100 text-green-700' },
      invalid: { text: '无效', className: 'bg-red-100 text-red-700' },
      pending: { text: '待验证', className: 'bg-yellow-100 text-yellow-700' },
      cancelled: { text: '已作废', className: 'bg-gray-100 text-gray-700' },
    };
    return badges[status] || { text: status, className: 'bg-gray-100 text-gray-700' };
  };

  const getRiskBadge = (level?: string) => {
    if (!level) return null;
    const badges: Record<string, { text: string; className: string }> = {
      low: { text: '低风险', className: 'bg-green-100 text-green-700' },
      medium: { text: '中风险', className: 'bg-yellow-100 text-yellow-700' },
      high: { text: '高风险', className: 'bg-red-100 text-red-700' },
    };
    return badges[level] || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">发票管理</h1>
          <p className="text-gray-600">管理所有发票，进行真伪验证和三单匹配</p>
        </div>
        <Link
          to="/invoices/upload"
          className="btn-primary flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>上传发票</span>
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索发票代码、号码、供应商..."
              className="input pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-48"
            value={verifyStatus}
            onChange={(e) => setVerifyStatus(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="verified">已验证</option>
            <option value="pending">待验证</option>
            <option value="invalid">无效</option>
            <option value="cancelled">已作废</option>
          </select>
          <select
            className="input w-full md:w-48"
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
          >
            <option value="">全部风险</option>
            <option value="low">低风险</option>
            <option value="medium">中风险</option>
            <option value="high">高风险</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无发票数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">发票代码/号码</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">销售方</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">购买方</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">开票日期</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">验证状态</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">风险等级</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: any) => {
                    const statusBadge = getStatusBadge(invoice.verifyStatus);
                    const riskBadge = getRiskBadge(invoice.riskLevel);
                    return (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">{invoice.invoiceCode}</div>
                          <div className="text-sm text-gray-500">{invoice.invoiceNo}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{invoice.seller?.name}</div>
                          <div className="text-sm text-gray-500">{invoice.seller?.taxNo}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium">{invoice.buyer?.name}</div>
                          <div className="text-sm text-gray-500">{invoice.buyer?.taxNo}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold">¥{(invoice.totalAmount || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-500">含税</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {invoice.issueDate ? format(new Date(invoice.issueDate), 'yyyy-MM-dd') : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusBadge.className}`}>
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {riskBadge ? (
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${riskBadge.className}`}>
                              {riskBadge.text}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            to={`/invoices/${invoice.id}`}
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

