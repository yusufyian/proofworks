import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reconciliationApi } from '../api/reconciliation';
import { format } from 'date-fns';
import { FileCheck, Search, Play, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Reconciliation() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [matchStatus, setMatchStatus] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: summaryData } = useQuery(
    ['reconciliation-summary', selectedDate],
    () => reconciliationApi.getSummary(selectedDate)
  );

  const { data: recordsData, isLoading } = useQuery(
    ['reconciliation-records', selectedDate, matchStatus, page],
    () => reconciliationApi.getRecords({
      reconDate: selectedDate,
      matchStatus,
      page,
      pageSize: 20,
    })
  );

  const triggerMutation = useMutation(
    (date: string) => reconciliationApi.triggerReconciliation(date),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['reconciliation-summary']);
        queryClient.invalidateQueries(['reconciliation-records']);
        queryClient.invalidateQueries(['dashboard-stats']);
      },
    }
  );

  // 修复数据访问路径：尝试 data.data.data 或 data.data
  const summary = summaryData?.data?.data || summaryData?.data || {};
  const records = recordsData?.data?.data?.records || recordsData?.data?.records || [];
  const pagination = recordsData?.data?.data || recordsData?.data || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            已对平
          </span>
        );
      case 'UNMATCHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            未匹配
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            待处理
          </span>
        );
      default:
        return null;
    }
  };

  const getChannelLabel = (channel: string) => {
    const map: { [key: string]: string } = {
      WECHAT: '微信支付',
      ALIPAY: '支付宝',
      BANK_CARD: '银行卡',
      E_CNY: '数字人民币',
    };
    return map[channel] || channel;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center space-x-3">
            <FileCheck className="w-8 h-8" />
            <span>对账管理</span>
          </h1>
          <p className="text-gray-600 mt-2">查看和管理对账记录</p>
        </div>
        <HelpTooltip
          mode="click"
          title="对账管理"
          content="对账管理用于查看和管理业务流水与支付流水的匹配情况。系统会自动根据订单号、金额、时间等字段进行匹配，对未匹配的记录会生成差异工单。您可以手动触发对账任务，查看对账统计信息，并处理差异记录。"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">对账统计</h2>
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input w-auto"
            />
            <button
              onClick={() => triggerMutation.mutate(selectedDate)}
              disabled={triggerMutation.isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{triggerMutation.isLoading ? '对账中...' : '触发对账'}</span>
            </button>
          </div>
        </div>

        {summary.reconDate && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">总交易笔数</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalTransactions || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">对平笔数</p>
              <p className="text-2xl font-bold text-green-700">{summary.matchedCount || 0}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">差异笔数</p>
              <p className="text-2xl font-bold text-red-700">{summary.unmatchedCount || 0}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">对平率</p>
              <p className="text-2xl font-bold text-purple-700">{(summary.matchRate || 0).toFixed(1)}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">对账记录</h2>
          <div className="flex items-center space-x-2">
            <select
              value={matchStatus}
              onChange={(e) => {
                setMatchStatus(e.target.value);
                setPage(1);
              }}
              className="input w-auto"
            >
              <option value="">全部状态</option>
              <option value="MATCHED">已对平</option>
              <option value="UNMATCHED">未匹配</option>
              <option value="PENDING">待处理</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无对账记录</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">对账记录号</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">订单号</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">支付渠道</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">匹配状态</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">匹配规则</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">匹配时间</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: any) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{record.recordId}</td>
                      <td className="py-3 px-4 text-sm">{record.businessRecord?.orderId || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {record.paymentRecord ? getChannelLabel(record.paymentRecord.channel) : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        ¥{record.businessRecord?.amount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.matchStatus)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.matchRule === 'exact' ? '精确匹配' :
                         record.matchRule === 'order_no' ? '订单号匹配' :
                         record.matchRule === 'amount_time' ? '金额时间匹配' : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.matchTime ? format(new Date(record.matchTime), 'yyyy-MM-dd HH:mm:ss') : '-'}
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

