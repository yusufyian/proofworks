import { useQuery } from 'react-query';
import { infringementsApi } from '../api/infringements';
import { ExternalLink } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Infringements() {
  const { data, isLoading } = useQuery('infringements', () => infringementsApi.getAll({ page: 1, pageSize: 100 }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const infringements = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">侵权监测</h1>
          <p className="text-gray-600">监测和管理疑似侵权案例</p>
        </div>
        <HelpTooltip
          mode="click"
          title="侵权监测说明"
          content="系统通过AI技术自动监测全网平台，识别疑似侵权行为。相似度超过90%的案例会被标记为高度疑似侵权。"
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">关联资产</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">疑似平台</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">相似度</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {infringements.map((inf: any) => (
                <tr key={inf.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">{inf.asset?.fileName || '未知'}</td>
                  <td className="py-4 px-4">{inf.suspectPlatform}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      inf.similarity >= 95 ? 'bg-red-100 text-red-700' :
                      inf.similarity >= 85 ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inf.similarity}%
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      inf.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      inf.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {inf.status === 'pending' ? '待处理' :
                       inf.status === 'investigating' ? '调查中' : '其他'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <a href={inf.suspectUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                      <span>查看</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
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

