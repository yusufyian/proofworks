import { useQuery } from 'react-query';
import { apiClient } from '../api/client';
import HelpTooltip from '../components/HelpTooltip';

export default function RightsProtection() {
  const { data, isLoading } = useQuery('rights-protections', () => 
    apiClient.get('/rights-protections', { params: { page: 1, pageSize: 100 } }).then(res => res.data)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const protections = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">维权管理</h1>
          <p className="text-gray-600">管理和跟踪维权案件</p>
        </div>
        <HelpTooltip
          mode="click"
          title="维权管理说明"
          content="维权管理包括从提交维权申请、律师审查、公证处公证、发送律师函到最终诉讼或和解的全流程管理。"
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">案件编号</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">关联资产</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">经济损失</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {protections.map((prot: any) => (
                <tr key={prot.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">{prot.caseId?.slice(0, 8)}...</td>
                  <td className="py-4 px-4">{prot.infringementCase?.asset?.fileName || '未知'}</td>
                  <td className="py-4 px-4">¥{(prot.evidence?.economicLoss || 0).toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      prot.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                      prot.status === 'lawyer_reviewing' ? 'bg-purple-100 text-purple-700' :
                      prot.status === 'settled' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {prot.status === 'submitted' ? '已提交' :
                       prot.status === 'lawyer_reviewing' ? '律师审查' :
                       prot.status === 'settled' ? '已和解' : '其他'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-indigo-600 hover:text-indigo-700">查看详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

