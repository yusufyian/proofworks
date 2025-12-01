import { useState } from 'react';
import { useQuery } from 'react-query';
import { matchApi } from '../api/matches';
import { invoiceApi } from '../api/invoices';
import { orderApi } from '../api/orders';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function ThreeWayMatch() {
  const [invoiceId, setInvoiceId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { data: invoices } = useQuery('invoices', () => invoiceApi.getList({ limit: 100 }));
  const { data: orders } = useQuery('orders', () => orderApi.getOrders({ limit: 100 }));
  const { data: receipts } = useQuery('receipts', () => orderApi.getReceipts({ limit: 100 }));

  const handleMatch = async () => {
    if (!invoiceId || !orderId || !receiptId) {
      alert('请选择发票、订单和入库单');
      return;
    }
    setLoading(true);
    setMatchResult(null);
    try {
      const response = await matchApi.performThreeWayMatch({ invoiceId, orderId, receiptId });
      setMatchResult(response.data.data);
    } catch (error: any) {
      setMatchResult({
        error: true,
        message: error.response?.data?.error || '匹配失败',
        details: error.response?.data?.details
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text mb-2 flex items-center space-x-2">
          <span>三单匹配</span>
          <HelpTooltip
            mode="click"
            title="三单匹配说明"
            content="三单匹配是指将采购订单、入库单和发票进行自动匹配，验证业务一致性。匹配规则包括：供应商一致、金额匹配（允许5%差异）、日期匹配（订单日期±30天）、明细匹配。"
          />
        </h1>
        <p className="text-gray-600">将采购订单、入库单和发票进行自动匹配验证</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">选择单据</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="label">选择发票</label>
            <select
              className="input"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
            >
              <option value="">请选择发票</option>
              {invoices?.data?.data?.map((invoice: any) => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoiceCode}-{invoice.invoiceNo} - ¥{invoice.totalAmount}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">选择采购订单</label>
            <select
              className="input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">请选择订单</option>
              {orders?.data?.data?.map((order: any) => (
                <option key={order.id} value={order.id}>
                  {order.orderNo} - ¥{order.totalAmount}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">选择入库单</label>
            <select
              className="input"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
            >
              <option value="">请选择入库单</option>
              {receipts?.data?.data?.map((receipt: any) => (
                <option key={receipt.id} value={receipt.id}>
                  {receipt.receiptNo} - ¥{receipt.totalAmount}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleMatch}
          disabled={!invoiceId || !orderId || !receiptId || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '匹配中...' : '执行匹配'}
        </button>
      </div>

      {matchResult && (
        <div className="card">
          <h2 className="text-xl font-bold mb-6">匹配结果</h2>
          {matchResult.error ? (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <XCircle className="w-6 h-6 text-red-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">匹配失败</h3>
                  <p className="text-red-700">{matchResult.message}</p>
                  {matchResult.details && (
                    <div className="mt-3 text-sm text-red-600">
                      <p>入库单关联的订单ID: {matchResult.details.receiptOrderId}</p>
                      <p>选择的订单ID: {matchResult.details.selectedOrderId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-6 rounded-xl border-2 ${
                matchResult.matchStatus === 'matched' 
                  ? 'bg-green-50 border-green-200' 
                  : matchResult.matchStatus === 'partial'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-3 mb-4">
                  {matchResult.matchStatus === 'matched' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                  ) : matchResult.matchStatus === 'partial' ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${
                      matchResult.matchStatus === 'matched' 
                        ? 'text-green-900' 
                        : matchResult.matchStatus === 'partial'
                        ? 'text-yellow-900'
                        : 'text-red-900'
                    }`}>
                      {matchResult.matchStatus === 'matched' 
                        ? '匹配成功' 
                        : matchResult.matchStatus === 'partial'
                        ? '部分匹配'
                        : '匹配失败'}
                    </h3>
                    {matchResult.notes && (
                      <p className={`text-sm ${
                        matchResult.matchStatus === 'matched' 
                          ? 'text-green-700' 
                          : matchResult.matchStatus === 'partial'
                          ? 'text-yellow-700'
                          : 'text-red-700'
                      }`}>
                        {matchResult.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">匹配详情</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">供应商匹配</span>
                      {matchResult.matchDetails?.supplierMatch ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">金额匹配</span>
                      {matchResult.matchDetails?.amountMatch ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">入库单金额匹配</span>
                      {matchResult.matchDetails?.receiptAmountMatch === true ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : matchResult.matchDetails?.receiptAmountMatch === false ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Info className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">日期匹配</span>
                      {matchResult.matchDetails?.dateMatch ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">明细匹配</span>
                      {matchResult.matchDetails?.itemMatch ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">金额信息</h4>
                  <div className="space-y-2 text-sm">
                    {matchResult.amountDifference !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">金额差异</span>
                        <span className={`font-semibold ${
                          Math.abs(matchResult.amountDifference) === 0 
                            ? 'text-green-600' 
                            : 'text-orange-600'
                        }`}>
                          ¥{matchResult.amountDifference.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {matchResult.differencePercent !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">差异百分比</span>
                        <span className={`font-semibold ${
                          matchResult.differencePercent <= 5 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {matchResult.differencePercent.toFixed(2)}%
                        </span>
                      </div>
                    )}
                    {matchResult.matchTime && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-600">匹配时间</span>
                        <span className="text-gray-700">
                          {format(new Date(matchResult.matchTime), 'yyyy-MM-dd HH:mm:ss')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-6">匹配规则说明</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-semibold">供应商匹配</div>
              <div className="text-sm text-gray-600">发票销售方必须与订单供应商一致</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-semibold">金额匹配</div>
              <div className="text-sm text-gray-600">发票金额与订单金额差异不超过5%</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-semibold">日期匹配</div>
              <div className="text-sm text-gray-600">发票开票日期在订单日期±30天范围内</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-semibold">明细匹配</div>
              <div className="text-sm text-gray-600">发票明细与订单明细项一致</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

