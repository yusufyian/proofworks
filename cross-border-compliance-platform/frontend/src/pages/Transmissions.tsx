import { useState } from 'react';
import { useQuery } from 'react-query';
import { transmissionsApi } from '../api/transmissions';
import { ArrowLeftRight, CheckCircle2, Clock, XCircle, Lock, Eye } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Transmissions() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['transmissions', statusFilter],
    () => transmissionsApi.getAll({ status: statusFilter || undefined, limit: 50 })
  );

  const transmissions = data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; text: string }> = {
      completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', text: '已完成' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: '处理中' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-700', text: '失败' },
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
            <ArrowLeftRight className="w-8 h-8 mr-3 text-primary-600" />
            跨境数据传输
          </h1>
          <p className="text-gray-600 mt-1">查看跨境数据传输记录</p>
        </div>
        <HelpTooltip
          content="跨境数据传输通过API网关进行，系统会自动进行数据脱敏（手机号、身份证、地址等）和加密（国密SM4）。所有传输记录都会记录审计日志并上链存证。传输通过VPN专线进行，确保安全性。"
          title="跨境数据传输"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">传输记录</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">全部状态</option>
            <option value="completed">已完成</option>
            <option value="pending">处理中</option>
            <option value="failed">失败</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">传输编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">源公司</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">目标公司</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据类型</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据大小</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">安全措施</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transmissions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.transmissionNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.sourceCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.destinationCompany}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.dataType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{t.dataSize} KB</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {t.desensitized && <Eye className="w-4 h-4 text-blue-500" title="已脱敏" />}
                        {t.encrypted && <Lock className="w-4 h-4 text-green-500" title="已加密" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
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

