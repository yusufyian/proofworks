import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { certificatesApi } from '../api/certificates';
import { ArrowLeft, FileText, Calendar, DollarSign, Hash, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const statusMap = {
  holding: { label: '持有中', color: 'bg-green-100 text-green-800' },
  transferred: { label: '已转让', color: 'bg-blue-100 text-blue-800' },
  pledged: { label: '已质押', color: 'bg-yellow-100 text-yellow-800' },
  redeemed: { label: '已核销', color: 'bg-gray-100 text-gray-800' },
  split: { label: '已拆分', color: 'bg-purple-100 text-purple-800' },
};

export default function CertificateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['certificate', id],
    () => certificatesApi.getById(id!)
  );

  const certificate = data?.data?.certificate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">凭证不存在</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/certificates')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回凭证列表</span>
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {certificate.certificateNumber}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                statusMap[certificate.status]?.color || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusMap[certificate.status]?.label || certificate.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">初始金额</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{certificate.initialAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">剩余金额</p>
                <p className="text-xl font-bold text-gray-900">
                  ¥{certificate.remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">签发日期</p>
                <p className="text-lg font-medium text-gray-900">
                  {format(new Date(certificate.issueDate), 'yyyy年MM月dd日')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">到期日期</p>
                <p className="text-lg font-medium text-gray-900">
                  {format(new Date(certificate.expiryDate), 'yyyy年MM月dd日')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">债权人（核心企业）</p>
              <p className="text-lg font-medium text-gray-900">
                {certificate.creditor?.name || '未知'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">债务人（当前持有人）</p>
              <p className="text-lg font-medium text-gray-900">
                {certificate.debtor?.name || '未知'}
              </p>
            </div>

            {certificate.blockchainTxHash && (
              <div className="flex items-start space-x-3">
                <Hash className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 mb-1">区块链交易哈希</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {certificate.blockchainTxHash}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {(certificate.contractHash || certificate.invoiceHash || certificate.receiptHash) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">关联文件哈希</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificate.contractHash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">合同哈希</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {certificate.contractHash}
                  </p>
                </div>
              )}
              {certificate.invoiceHash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">发票哈希</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {certificate.invoiceHash}
                  </p>
                </div>
              )}
              {certificate.receiptHash && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">验收单哈希</p>
                  <p className="text-sm font-mono text-gray-900 break-all">
                    {certificate.receiptHash}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

