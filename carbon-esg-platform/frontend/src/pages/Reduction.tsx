import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reductionApi } from '../api/reduction';
import { blockchainApi } from '../api/blockchain';
import { TrendingDown, Search, Award, Clock, Link2, Copy, CheckCircle2 } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Reduction() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('reductions', () => 
    reductionApi.getReductionProjects({ status: statusFilter || undefined })
  );

  const certifyMutation = useMutation(
    (id: string) => blockchainApi.certify('reduction_project', id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('reductions');
        queryClient.invalidateQueries('blockchain-records');
      },
    }
  );

  const projects = data?.data || [];

  const handleCertify = async (id: string) => {
    if (confirm('确认要将此减排项目上链存证（生成CCER代币）吗？')) {
      try {
        await certifyMutation.mutateAsync(id);
        alert('上链存证成功！已生成CCER代币');
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
  const filteredProjects = projects.filter((p: any) => {
    if (searchTerm) {
      return p.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      planning: { color: 'bg-gray-100 text-gray-700', label: '规划中' },
      monitoring: { color: 'bg-blue-100 text-blue-700', label: '监测中' },
      verification: { color: 'bg-yellow-100 text-yellow-700', label: '核证中' },
      certified: { color: 'bg-green-100 text-green-700', label: '已认证' },
      trading: { color: 'bg-purple-100 text-purple-700', label: '交易中' },
    };

    const config = statusConfig[status] || statusConfig.planning;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getProjectTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      renewable_energy: '可再生能源',
      energy_efficiency: '能效提升',
      forestry: '林业碳汇',
      other: '其他',
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">减排项目</h1>
          <p className="text-gray-600">管理企业减排项目及CCER等碳资产</p>
        </div>
        <HelpTooltip
          mode="click"
          title="减排项目说明"
          content="减排项目包括可再生能源、能效提升、林业碳汇等类型。通过对比基准线排放和实际排放，计算减排量。通过第三方核证后可获得CCER（国家核证自愿减排量）等碳资产，可用于碳交易或抵消排放。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索项目名称..."
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
            <option value="planning">规划中</option>
            <option value="monitoring">监测中</option>
            <option value="verification">核证中</option>
            <option value="certified">已认证</option>
            <option value="trading">交易中</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无减排项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project: any) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{project.projectName}</h3>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(project.status)}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-500">项目类型: </span>
                  <span className="text-sm font-medium">{getProjectTypeLabel(project.projectType)}</span>
                  <span className="text-sm text-gray-500 ml-4">年份: {project.vintage}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">基准线</p>
                    <p className="text-sm font-semibold">{project.baselineEmissions?.toFixed(1)} tCO2e</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">实际排放</p>
                    <p className="text-sm font-semibold">{project.actualEmissions?.toFixed(1)} tCO2e</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">减排量</p>
                    <p className="text-lg font-bold text-primary-600">{project.reductionAmount?.toFixed(1)} tCO2e</p>
                  </div>
                </div>

                {project.certificationNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 pt-4 border-t border-gray-200 mb-2">
                    <Award className="w-4 h-4 text-green-500" />
                    <span>认证编号: {project.certificationNumber}</span>
                  </div>
                )}
                {project.blockchainTokenId || project.blockchainHash ? (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Link2 className="w-4 h-4 text-primary-600" />
                        <span className="text-gray-600">代币ID:</span>
                        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {(project.blockchainTokenId || project.blockchainHash)?.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => handleCopyHash(project.blockchainTokenId || project.blockchainHash!)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copiedHash === (project.blockchainTokenId || project.blockchainHash) ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">CCER代币</span>
                    </div>
                  </div>
                ) : project.status === 'certified' || project.status === 'trading' ? (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCertify(project.id)}
                      disabled={certifyMutation.isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>{certifyMutation.isLoading ? '生成CCER代币中...' : '生成CCER代币'}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
