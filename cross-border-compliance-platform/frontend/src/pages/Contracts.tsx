import { useState } from 'react';
import { useQuery } from 'react-query';
import { contractsApi } from '../api/contracts';
import { FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Contracts() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['contracts', statusFilter],
    () => contractsApi.getAll({ status: statusFilter || undefined, limit: 50 })
  );

  const contracts = data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; text: string }> = {
      signed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', text: '已签署' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: '待签署' },
      expired: { icon: XCircle, color: 'bg-gray-100 text-gray-700', text: '已过期' },
    };
    const s = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${s.color}`}>
        <s.icon className="w-4 h-4" />
        <span>{s.text}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            标准合同管理
          </h1>
          <p className="text-gray-600 mt-1">管理个人信息出境标准合同</p>
        </div>
        <HelpTooltip
          content="标准合同是指按照《个人信息出境标准合同办法》签署的合规合同。合同需明确个人信息出境的目的是、范围、境外接收方的处理义务等。合同签署后需在区块链上存证，确保合同完整性和可追溯性。"
          title="标准合同"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">合同列表</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部状态</option>
            <option value="signed">已签署</option>
            <option value="pending">待签署</option>
            <option value="expired">已过期</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">合同编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">境内方</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">境外方</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据类型</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据量</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">区块链</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contracts.map((contract: any) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{contract.contractNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{contract.domesticParty}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{contract.foreignParty}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{contract.dataType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{contract.dataVolume?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3">{getStatusBadge(contract.status)}</td>
                    <td className="px-4 py-3">
                      {contract.blockchainTxHash ? (
                        <span className="text-xs text-primary-600 font-mono">
                          {contract.blockchainTxHash.substring(0, 10)}...
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

