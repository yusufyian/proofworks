import { useState } from 'react';
import { useQuery } from 'react-query';
import { reportsApi } from '../api/reports';
import { FileBarChart, Building2, Ship, DollarSign } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Reports() {
  const [agencyFilter, setAgencyFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['reports', agencyFilter],
    () => reportsApi.getAll({ agency: agencyFilter || undefined, limit: 50 })
  );

  const reports = data?.data || [];

  const getAgencyIcon = (agency: string) => {
    const iconMap: Record<string, any> = {
      '网信办': Building2,
      '海关': Ship,
      '外管局': DollarSign,
    };
    return iconMap[agency] || FileBarChart;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileBarChart className="w-8 h-8 mr-3 text-primary-600" />
            监管报送
          </h1>
          <p className="text-gray-600 mt-1">查看监管报送记录</p>
        </div>
        <HelpTooltip
          content="监管报送包括：1) 网信办报送（数据出境报告、安全事件报告、年度合规报告）；2) 海关报送（报关单数据、舱单数据、进出口许可证）；3) 外管局报送（大额交易报告、可疑交易报告、外汇收支申报）。所有报送记录均上链存证。"
          title="监管报送"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">报送记录</h2>
          <select
            value={agencyFilter}
            onChange={(e) => setAgencyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部机构</option>
            <option value="网信办">网信办</option>
            <option value="海关">海关</option>
            <option value="外管局">外管局</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">报送编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">报送机构</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">报送类型</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">报告周期</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">提交时间</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">区块链</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report: any) => {
                  const Icon = getAgencyIcon(report.agency);
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.reportNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4 text-primary-600" />
                          <span className="text-sm text-gray-700">{report.agency}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.reportType}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{report.period}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {report.status === 'submitted' ? '已提交' : report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {report.blockchainTxHash ? (
                          <span className="text-xs text-primary-600 font-mono">
                            {report.blockchainTxHash.substring(0, 10)}...
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

