import { useState } from 'react';
import { useQuery } from 'react-query';
import { settlementApi } from '../api/settlement';
import { format } from 'date-fns';
import { DollarSign, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Settlement() {
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: recordsData, isLoading } = useQuery(
    ['settlement-records', status, page],
    () => settlementApi.getRecords({ status, page, pageSize: 20 })
  );

  // 修复数据访问路径：尝试 data.data.data 或 data.data
  const records = recordsData?.data?.data?.records || recordsData?.data?.records || [];
  const pagination = recordsData?.data?.data || recordsData?.data || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            成功
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            待处理
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            失败
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
            <DollarSign className="w-8 h-8" />
            <span>清分管理</span>
          </h1>
          <p className="text-gray-600 mt-2">查看和管理资金清分记录</p>
        </div>
        <HelpTooltip
          mode="click"
          title="清分管理"
          content="清分管理用于查看和管理订单金额的清分记录。清分是指将订单金额按照一定规则分配给不同的账户，例如平台服务费、支付手续费、商户货款等。系统支持按比例、固定金额或余额方式进行清分，所有清分记录都会上链存证，确保资金流转的可追溯性。"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">清分记录</h2>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input w-auto"
          >
            <option value="">全部状态</option>
            <option value="SUCCESS">成功</option>
            <option value="PENDING">待处理</option>
            <option value="FAILED">失败</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无清分记录</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {records.map((record: any) => (
                <div key={record.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{record.settlementId}</h3>
                        {getStatusBadge(record.status)}
                      </div>
                      <p className="text-sm text-gray-600">订单号: {record.orderId}</p>
                      <p className="text-sm text-gray-600">
                        清分时间: {format(new Date(record.settlementTime), 'yyyy-MM-dd HH:mm:ss')}
                      </p>
                      {record.blockchainTxHash && (
                        <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                          <span>链上哈希:</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{record.blockchainTxHash.substring(0, 20)}...</code>
                          <ExternalLink className="w-3 h-3" />
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">总金额</p>
                      <p className="text-2xl font-bold text-primary-600">¥{record.totalAmount?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">清分明细</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {record.splits?.map((split: any, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900">{split.accountName}</p>
                          <p className="text-lg font-bold text-primary-600 mt-1">¥{split.amount?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-gray-500 mt-1">{split.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
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

