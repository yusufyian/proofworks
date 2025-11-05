import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { certificatesApi } from '../api/certificates';
import { companiesApi, Company } from '../api/companies';
import { X, FileText } from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import Modal from './Modal';

interface Props {
  onClose: () => void;
}

export default function CreateCertificateModal({ onClose }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    debtorId: '',
    initialAmount: '',
    expiryDate: '',
    contractHash: '',
    invoiceHash: '',
    receiptHash: '',
  });
  const [error, setError] = useState('');

  // 获取供应商列表
  const { data: suppliersData, isLoading: loadingSuppliers } = useQuery(
    'suppliers',
    () => companiesApi.getAll({ type: 'supplier' })
  );

  const suppliers = suppliersData?.data?.companies || [];

  const mutation = useMutation(certificatesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('certificates');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || '创建失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      ...formData,
      initialAmount: parseFloat(formData.initialAmount),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="签发新凭证"
      icon={<FileText className="w-6 h-6 text-white" />}
      headerColor="primary"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center space-x-2">
              <X className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="label flex items-center space-x-2">
              <span>选择供应商 *</span>
              <HelpTooltip
                mode="click"
                title="选择供应商"
                content="选择要为其签发数字凭证的供应商。数字凭证是核心企业对供应商应付款项的数字化凭证，可以在供应链中流转和融资。"
              />
            </label>
            {loadingSuppliers ? (
              <div className="input flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-500">加载中...</span>
              </div>
            ) : suppliers.length === 0 ? (
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-gray-500">
                暂无供应商
              </div>
            ) : (
              <select
                required
                className="input"
                value={formData.debtorId}
                onChange={(e) => setFormData({ ...formData, debtorId: e.target.value })}
              >
                <option value="">请选择供应商</option>
                {suppliers.map((supplier: Company) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name} ({supplier.unifiedSocialCreditCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center space-x-2">
                <span>凭证金额 *</span>
                <HelpTooltip
                  mode="click"
                  title="凭证金额"
                  content="输入凭证的面值金额，即核心企业应向供应商支付的款项总额。该金额将被记录在区块链上，确保不可篡改。"
                />
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">¥</span>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  className="input pl-8"
                  placeholder="0.00"
                  value={formData.initialAmount}
                  onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>到期日期 *</span>
                <HelpTooltip
                  mode="click"
                  title="到期日期"
                  content="凭证的有效期限，到期后凭证将自动失效。供应商需在到期前完成转让、融资或核销操作。"
                />
              </label>
              <input
                type="date"
                required
                className="input"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center space-x-2">
              <span>合同哈希</span>
              <HelpTooltip
                mode="click"
                title="合同哈希"
                content="上传合同文件后生成的哈希值，用于证明凭证对应的真实合同。哈希值是文件的唯一指纹，任何修改都会导致哈希值变化，确保合同真实性。"
              />
            </label>
            <input
              type="text"
              className="input font-mono text-sm"
              placeholder="可选，输入合同文件的哈希值"
              value={formData.contractHash}
              onChange={(e) => setFormData({ ...formData, contractHash: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center space-x-2">
                <span>发票哈希</span>
                <HelpTooltip
                  mode="click"
                  title="发票哈希"
                  content="关联发票文件的哈希值，用于证明交易的真实性。多个文件的哈希值可以共同验证凭证的合法性。"
                />
              </label>
              <input
                type="text"
                className="input font-mono text-sm"
                placeholder="可选"
                value={formData.invoiceHash}
                onChange={(e) => setFormData({ ...formData, invoiceHash: e.target.value })}
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>验收单哈希</span>
                <HelpTooltip
                  mode="click"
                  title="验收单哈希"
                  content="验收单文件的哈希值，证明货物或服务已经验收完成。完整的文件链（合同+发票+验收单）可以最大程度降低风险。"
                />
              </label>
              <input
                type="text"
                className="input font-mono text-sm"
                placeholder="可选"
                value={formData.receiptHash}
                onChange={(e) => setFormData({ ...formData, receiptHash: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={mutation.isLoading || !formData.debtorId}
              className="btn-primary disabled:opacity-50"
            >
              {mutation.isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>创建中...</span>
                </span>
              ) : (
                '创建凭证'
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
