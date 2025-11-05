import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { financingApi } from '../api/financing';
import { certificatesApi } from '../api/certificates';
import { companiesApi, Company } from '../api/companies';
import { X, CreditCard } from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import Modal from './Modal';

interface Props {
  onClose: () => void;
}

export default function CreateFinancingModal({ onClose }: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    certificateId: '',
    financierId: '',
    amount: '',
    term: '',
  });
  const [error, setError] = useState('');

  // 获取可用凭证列表
  const { data: certificatesData } = useQuery(
    'my-certificates',
    () => certificatesApi.getAll({ status: 'holding' })
  );

  // 获取银行列表
  const { data: banksData, isLoading: loadingBanks } = useQuery(
    'banks',
    () => companiesApi.getAll({ type: 'bank' })
  );

  const certificates = certificatesData?.data?.certificates || [];
  const banks = banksData?.data?.companies || [];

  const mutation = useMutation(financingApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('financing');
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || '申请失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      term: parseInt(formData.term),
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="申请融资"
      icon={<CreditCard className="w-6 h-6 text-white" />}
      headerColor="green"
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
              <span>选择凭证 *</span>
              <HelpTooltip
                mode="click"
                title="选择凭证"
                content={'选择您持有的、状态为"持有中"的数字凭证。只有未被转让或质押的凭证才能用于融资申请。融资金额不能超过凭证的剩余金额。'}
              />
            </label>
            {certificates.length === 0 ? (
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-gray-500">
                暂无可用凭证
              </div>
            ) : (
              <select
                required
                className="input"
                value={formData.certificateId}
                onChange={(e) => setFormData({ ...formData, certificateId: e.target.value })}
              >
                <option value="">请选择凭证</option>
                {certificates.map((cert: any) => (
                  <option key={cert.id} value={cert.id}>
                    {cert.certificateNumber} - ¥{cert.remainingAmount.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="label flex items-center space-x-2">
              <span>选择融资方（银行） *</span>
              <HelpTooltip
                mode="click"
                title="选择融资方"
                content="选择提供融资服务的银行机构。银行将根据凭证的真实性和您的信用状况决定是否批准融资申请。选择合作过的银行可以提高审批通过率。"
              />
            </label>
            {loadingBanks ? (
              <div className="input flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-500">加载中...</span>
              </div>
            ) : banks.length === 0 ? (
              <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-gray-500">
                暂无银行
              </div>
            ) : (
              <select
                required
                className="input"
                value={formData.financierId}
                onChange={(e) => setFormData({ ...formData, financierId: e.target.value })}
              >
                <option value="">请选择银行</option>
                {banks.map((bank: Company) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.unifiedSocialCreditCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center space-x-2">
                <span>融资金额 *</span>
                <HelpTooltip
                  mode="click"
                  title="融资金额"
                  content="申请融资的金额，不能超过所选凭证的剩余金额。银行通常会根据凭证金额和您的信用状况确定实际放款比例（通常为70%-90%）。"
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>融资期限（天） *</span>
                <HelpTooltip
                  mode="click"
                  title="融资期限"
                  content="融资的天数，通常不超过凭证的到期日期。融资到期后需要偿还本金和利息。选择合适的期限有助于降低融资成本。"
                />
              </label>
              <input
                type="number"
                required
                min="1"
                className="input"
                placeholder="30"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
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
              disabled={mutation.isLoading || !formData.certificateId || !formData.financierId}
              className="btn-primary disabled:opacity-50"
            >
              {mutation.isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>提交中...</span>
                </span>
              ) : (
                '提交申请'
              )}
            </button>
          </div>
        </form>
    </Modal>
  );
}
