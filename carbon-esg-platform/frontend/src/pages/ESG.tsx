import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { esgApi } from '../api/esg';
import { blockchainApi } from '../api/blockchain';
import { Award, Search, FileText, Link2, Copy, CheckCircle2 } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function ESG() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('esg-reports', () => 
    esgApi.getESGReports({ status: statusFilter || undefined })
  );

  const certifyMutation = useMutation(
    (id: string) => blockchainApi.certify('esg_report', id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('esg-reports');
        queryClient.invalidateQueries('blockchain-records');
      },
    }
  );

  const reports = data?.data || [];

  const handleCertify = async (id: string) => {
    if (confirm('确认要将此ESG报告上链存证吗？')) {
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
  const filteredReports = reports.filter((r: any) => {
    if (searchTerm) {
      return r.year?.toString().includes(searchTerm) ||
             r.standard?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getStandardBadge = (standard: string) => {
    const colors: Record<string, string> = {
      GRI: 'bg-blue-100 text-blue-700',
      TCFD: 'bg-green-100 text-green-700',
      ISSB: 'bg-purple-100 text-purple-700',
      SASB: 'bg-orange-100 text-orange-700',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[standard] || colors.GRI}`}>
        {standard}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">ESG报告</h1>
          <p className="text-gray-600">环境、社会和治理（ESG）信息披露报告管理</p>
        </div>
        <HelpTooltip
          mode="click"
          title="ESG报告说明"
          content="ESG报告是企业环境（Environmental）、社会（Social）和治理（Governance）方面的信息披露报告。支持多种国际标准：GRI（全球报告倡议组织）、TCFD（气候相关财务信息披露工作组）、ISSB（国际可持续准则理事会）、SASB（可持续会计准则委员会）。ESG报告有助于提升企业透明度，吸引ESG投资，提升品牌价值。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索报告年份或标准..."
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
            <option value="published">已发布</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无ESG报告</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report: any) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{report.year}年度ESG报告</h3>
                      {getStandardBadge(report.standard)}
                      {report.status === 'published' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                          已发布
                        </span>
                      )}
                    </div>
                    {report.publishedAt && (
                      <p className="text-sm text-gray-500">发布时间: {new Date(report.publishedAt).toLocaleDateString('zh-CN')}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">环境指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">范围1排放</span>
                        <span className="font-semibold">{report.environmentalMetrics?.ghgScope1?.toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">范围2排放</span>
                        <span className="font-semibold">{report.environmentalMetrics?.ghgScope2?.toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">范围3排放</span>
                        <span className="font-semibold">{report.environmentalMetrics?.ghgScope3?.toFixed(1)} tCO2e</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">可再生能源比例</span>
                        <span className="font-semibold">{(report.environmentalMetrics?.renewableEnergyRate * 100)?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">社会指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">员工总数</span>
                        <span className="font-semibold">{report.socialMetrics?.totalEmployees?.toLocaleString()}人</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">新进员工</span>
                        <span className="font-semibold">{report.socialMetrics?.newHires?.toLocaleString()}人</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">培训时长</span>
                        <span className="font-semibold">{report.socialMetrics?.trainingHours?.toLocaleString()}小时</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">安全事故</span>
                        <span className="font-semibold">{report.socialMetrics?.accidents || 0}起</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">治理指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">董事会独立性</span>
                        <span className="font-semibold">{(report.governanceMetrics?.boardIndependence * 100)?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">反腐败案件</span>
                        <span className="font-semibold">{report.governanceMetrics?.antiCorruptionCases || 0}起</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">伦理培训</span>
                        <span className="font-semibold">{report.governanceMetrics?.ethicsTraining?.toLocaleString()}人次</span>
                      </div>
                    </div>
                  </div>
                </div>

                {report.blockchainHash ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Link2 className="w-4 h-4 text-primary-600" />
                        <span className="text-gray-600">区块链哈希:</span>
                        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {report.blockchainHash.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => handleCopyHash(report.blockchainHash!)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copiedHash === report.blockchainHash ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">已上链</span>
                    </div>
                  </div>
                ) : report.status === 'published' ? (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleCertify(report.id)}
                      disabled={certifyMutation.isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>{certifyMutation.isLoading ? '上链中...' : '上链存证'}</span>
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
