import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { inventoryApi } from '../api/inventory';
import { blockchainApi } from '../api/blockchain';
import { FileText, Search, CheckCircle2, Clock, Link2, Copy } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('inventories', () => inventoryApi.getInventories({ status: statusFilter || undefined }));

  const certifyMutation = useMutation(
    (id: string) => blockchainApi.certify('inventory', id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventories');
        queryClient.invalidateQueries('blockchain-records');
      },
    }
  );

  const inventories = data?.data || [];

  const handleCertify = async (id: string) => {
    if (confirm('确认要将此记录上链存证吗？')) {
      try {
        await certifyMutation.mutateAsync(id);
        alert('上链存证成功！');
      } catch (error: any) {
        alert(error.response?.data?.error || '上链存证失败');
      }
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };
  const filteredInventories = inventories.filter((inv: any) => {
    if (searchTerm) {
      return inv.period?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             inv.certificationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
      draft: { color: 'bg-gray-100 text-gray-700', label: '草稿', icon: FileText },
      submitted: { color: 'bg-blue-100 text-blue-700', label: '已提交', icon: Clock },
      verified: { color: 'bg-yellow-100 text-yellow-700', label: '已核证', icon: CheckCircle2 },
      certified: { color: 'bg-green-100 text-green-700', label: '已认证', icon: CheckCircle2 },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">组织碳盘查</h1>
          <p className="text-gray-600">管理企业组织层面的温室气体排放数据</p>
        </div>
        <HelpTooltip
          mode="click"
          title="组织碳盘查说明"
          content="组织碳盘查是根据国际标准（如ISO 14064-1）对企业组织层面的温室气体排放进行全面核算。包括三个范围：范围1（直接排放）、范围2（间接排放-外购能源）、范围3（其他间接排放）。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索盘查期间或认证编号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 input"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="">全部状态</option>
            <option value="draft">草稿</option>
            <option value="submitted">已提交</option>
            <option value="verified">已核证</option>
            <option value="certified">已认证</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : filteredInventories.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无碳盘查记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInventories.map((inventory: any) => (
              <div
                key={inventory.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">盘查期间: {inventory.period}</h3>
                      {getStatusBadge(inventory.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">范围1排放</p>
                        <p className="text-lg font-semibold text-gray-900">{inventory.scope1Emissions?.toFixed(2)} tCO2e</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">范围2排放</p>
                        <p className="text-lg font-semibold text-gray-900">{inventory.scope2Emissions?.toFixed(2)} tCO2e</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">范围3排放</p>
                        <p className="text-lg font-semibold text-gray-900">{inventory.scope3Emissions?.toFixed(2)} tCO2e</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">总排放量</p>
                        <p className="text-lg font-semibold text-primary-600">{inventory.totalEmissions?.toFixed(2)} tCO2e</p>
                      </div>
                    </div>
                    {inventory.certificationNumber && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>认证编号: {inventory.certificationNumber}</span>
                      </div>
                    )}
                    {inventory.blockchainHash ? (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm">
                            <Link2 className="w-4 h-4 text-primary-600" />
                            <span className="text-gray-600">区块链哈希:</span>
                            <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {inventory.blockchainHash.substring(0, 16)}...
                            </code>
                            <button
                              onClick={() => handleCopyHash(inventory.blockchainHash)}
                              className="text-primary-600 hover:text-primary-700"
                            >
                              {copiedHash === inventory.blockchainHash ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">已上链</span>
                        </div>
                      </div>
                    ) : inventory.status === 'certified' || inventory.status === 'verified' ? (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleCertify(inventory.id)}
                          disabled={certifyMutation.isLoading}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          <Link2 className="w-4 h-4" />
                          <span>{certifyMutation.isLoading ? '上链中...' : '上链存证'}</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
