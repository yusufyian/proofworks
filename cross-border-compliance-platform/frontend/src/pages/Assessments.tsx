import { useState } from 'react';
import { useQuery } from 'react-query';
import { assessmentsApi } from '../api/assessments';
import { FileCheck, CheckCircle2, Clock, XCircle, HelpCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Assessments() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data, isLoading } = useQuery(
    ['assessments', statusFilter],
    () => assessmentsApi.getAll({ status: statusFilter || undefined, limit: 50 })
  );

  const assessments = data?.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { icon: any; color: string; text: string }> = {
      approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', text: '已批准' },
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', text: '待审批' },
      rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', text: '已拒绝' },
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
            <FileCheck className="w-8 h-8 mr-3 text-primary-600" />
            数据出境评估
          </h1>
          <p className="text-gray-600 mt-1">管理数据出境合规评估记录</p>
        </div>
        <HelpTooltip
          content="数据出境评估包括三种路径：1) 安全评估（适用于重要数据、100万+个人信息）；2) 标准合同（适用于一般数据、<100万个人信息）；3) 个人信息保护认证（适用于持续出境）。系统会自动记录所有评估流程并在区块链上存证。"
          title="数据出境评估"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">评估记录</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部状态</option>
            <option value="approved">已批准</option>
            <option value="pending">待审批</option>
            <option value="rejected">已拒绝</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">评估编号</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">出境路径</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据类型</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">数据量</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">目的地</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">区块链</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assessments.map((assessment: any) => (
                  <tr key={assessment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.assessmentNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {assessment.path === 'security_assessment' ? '安全评估' : 
                       assessment.path === 'standard_contract' ? '标准合同' : '认证'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{assessment.dataType}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{assessment.dataVolume?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{assessment.destinationRegion}</td>
                    <td className="px-4 py-3">{getStatusBadge(assessment.status)}</td>
                    <td className="px-4 py-3">
                      {assessment.blockchainTxHash ? (
                        <span className="text-xs text-primary-600 font-mono">
                          {assessment.blockchainTxHash.substring(0, 10)}...
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

