import { useState } from 'react';
import { useQuery } from 'react-query';
import { blockchainApi } from '../api/blockchain';
import { Network, Copy, Check } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Blockchain() {
  const [dataTypeFilter, setDataTypeFilter] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['blockchain', dataTypeFilter],
    () => blockchainApi.getAll({ dataType: dataTypeFilter || undefined, limit: 100 })
  );

  const records = data?.data || [];

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  const getDataTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      assessment: '数据出境评估',
      contract: '标准合同',
      transmission: '数据传输',
      payment: '跨境支付',
      order: '供应链订单',
      report: '监管报送',
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Network className="w-8 h-8 mr-3 text-primary-600" />
            区块链记录
          </h1>
          <p className="text-gray-600 mt-1">查看所有上链存证的记录</p>
        </div>
        <HelpTooltip
          content="所有关键业务操作都会在区块链上存证，包括数据出境评估、标准合同、数据传输、跨境支付、供应链订单和监管报送。区块链存证确保数据不可篡改，可追溯可审计。点击交易哈希可以复制完整哈希值进行验证。"
          title="区块链存证"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">存证记录</h2>
          <select
            value={dataTypeFilter}
            onChange={(e) => setDataTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部类型</option>
            <option value="assessment">数据出境评估</option>
            <option value="contract">标准合同</option>
            <option value="transmission">数据传输</option>
            <option value="payment">跨境支付</option>
            <option value="order">供应链订单</option>
            <option value="report">监管报送</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据类型</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">交易哈希</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">区块号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">区块哈希</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">时间戳</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((record: any) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {getDataTypeLabel(record.dataType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-gray-900">
                          {record.txHash?.substring(0, 20)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(record.txHash)}
                          className="text-gray-400 hover:text-primary-600 transition-colors"
                          title="复制完整哈希"
                        >
                          {copiedHash === record.txHash ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                      #{record.blockNumber?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">
                        {record.blockHash?.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <div className="text-3xl font-bold mb-2">{records.length}</div>
          <div className="text-sm text-white/80">总存证记录</div>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="text-3xl font-bold mb-2">
            {records.filter((r: any) => r.dataType === 'assessment').length}
          </div>
          <div className="text-sm text-white/80">评估记录</div>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="text-3xl font-bold mb-2">
            {records.filter((r: any) => r.blockchainTxHash).length}
          </div>
          <div className="text-sm text-white/80">已验证记录</div>
        </div>
      </div>
    </div>
  );
}

