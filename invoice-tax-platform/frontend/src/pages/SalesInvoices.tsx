import { useState } from 'react';
import { useQuery } from 'react-query';
import { salesApi } from '../api/sales';
import { CreditCard, Search, Plus } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesInvoices() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['sales-invoices', search, page],
    () => salesApi.getInvoices({ search, page, limit: 20 })
  );

  const invoices = data?.data?.data || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">销售开票</h1>
          <p className="text-gray-600">管理销售发票开具记录</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>开具发票</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索发票代码、号码、客户..."
              className="input pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无销售发票数据</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">发票代码/号码</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">客户名称</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">开票日期</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice: any) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium">{invoice.invoiceCode}</div>
                        <div className="text-sm text-gray-500">{invoice.invoiceNo}</div>
                      </td>
                      <td className="py-4 px-4">{invoice.customerName}</td>
                      <td className="py-4 px-4 font-semibold">¥{(invoice.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-600">
                        {invoice.issueDate ? format(new Date(invoice.issueDate), 'yyyy-MM-dd') : '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          invoice.status === 'issued' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status === 'issued' ? '已开具' :
                           invoice.status === 'cancelled' ? '已作废' : '已红冲'}
                        </span>
                      </td>
                    </tr>
                  ))}
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

