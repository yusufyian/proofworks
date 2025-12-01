import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { invoiceApi } from '../api/invoices';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function InvoiceDetail() {
  const { id } = useParams();
  const { data, isLoading, refetch } = useQuery(
    ['invoice', id],
    () => invoiceApi.getDetail(id!),
    { enabled: !!id }
  );

  const invoice = data?.data;

  const handleVerify = async () => {
    if (!id) return;
    try {
      await invoiceApi.verify(id);
      refetch();
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">发票不存在</p>
        <Link to="/invoices" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          返回发票列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/invoices"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold gradient-text">发票详情</h1>
            <p className="text-gray-600 mt-1">{invoice.invoiceCode} - {invoice.invoiceNo}</p>
          </div>
        </div>
        <button
          onClick={handleVerify}
          className="btn-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>重新验证</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <span>基本信息</span>
              <HelpTooltip
                mode="click"
                title="发票基本信息"
                content="包含发票代码、号码、类型、开票日期等基础信息。发票代码为12位数字，发票号码为8位数字。"
              />
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">发票代码</label>
                <p className="font-semibold text-lg">{invoice.invoiceCode}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">发票号码</label>
                <p className="font-semibold text-lg">{invoice.invoiceNo}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">发票类型</label>
                <p className="font-semibold">
                  {invoice.invoiceType === 'special' ? '增值税专用发票' :
                   invoice.invoiceType === 'normal' ? '增值税普通发票' : '电子发票'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">开票日期</label>
                <p className="font-semibold">
                  {invoice.issueDate ? format(new Date(invoice.issueDate), 'yyyy年MM月dd日') : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">销售方信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">名称</label>
                <p className="font-semibold">{invoice.seller?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">税号</label>
                <p className="font-semibold">{invoice.seller?.taxNo}</p>
              </div>
              {invoice.seller?.address && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">地址</label>
                  <p className="font-semibold">{invoice.seller.address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">购买方信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">名称</label>
                <p className="font-semibold">{invoice.buyer?.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">税号</label>
                <p className="font-semibold">{invoice.buyer?.taxNo}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6">金额信息</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">不含税金额</label>
                <p className="font-bold text-2xl text-gray-900">¥{(invoice.amount || 0).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">税率</label>
                <p className="font-semibold text-lg">{(invoice.taxRate || 0) * 100}%</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">税额</label>
                <p className="font-semibold text-lg">¥{(invoice.taxAmount || 0).toLocaleString()}</p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm text-gray-500">价税合计</label>
                <p className="font-bold text-2xl text-indigo-600">¥{(invoice.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">验证状态</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">验证状态</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  invoice.verifyStatus === 'verified' ? 'bg-green-100 text-green-700' :
                  invoice.verifyStatus === 'invalid' ? 'bg-red-100 text-red-700' :
                  invoice.verifyStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {invoice.verifyStatus === 'verified' ? '已验证' :
                   invoice.verifyStatus === 'invalid' ? '无效' :
                   invoice.verifyStatus === 'pending' ? '待验证' : '已作废'}
                </span>
              </div>
              {invoice.verifyTime && (
                <div>
                  <label className="text-sm text-gray-500">验证时间</label>
                  <p className="font-semibold">
                    {format(new Date(invoice.verifyTime), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </div>
              )}
              {invoice.verifyResult && (
                <div>
                  <label className="text-sm text-gray-500">验证结果</label>
                  <p className="font-semibold">{invoice.verifyResult}</p>
                </div>
              )}
            </div>
          </div>

          {invoice.riskLevel && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">风险信息</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">风险等级</span>
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    invoice.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                    invoice.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {invoice.riskLevel === 'high' ? '高风险' :
                     invoice.riskLevel === 'medium' ? '中风险' : '低风险'}
                  </span>
                </div>
                {invoice.riskReasons && invoice.riskReasons.length > 0 && (
                  <div>
                    <label className="text-sm text-gray-500">风险原因</label>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {invoice.riskReasons.map((reason: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.blockchainTxHash && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">区块链存证</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-500">交易哈希</label>
                  <p className="font-mono text-xs break-all">{invoice.blockchainTxHash}</p>
                </div>
                {invoice.blockchainHeight && (
                  <div>
                    <label className="text-sm text-gray-500">区块高度</label>
                    <p className="font-semibold">{invoice.blockchainHeight.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

