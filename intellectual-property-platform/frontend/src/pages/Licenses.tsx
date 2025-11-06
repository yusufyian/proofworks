import { useQuery } from 'react-query';
import { apiClient } from '../api/client';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Licenses() {
  const { data, isLoading } = useQuery('licenses', () => 
    apiClient.get('/licenses', { params: { page: 1, pageSize: 100 } }).then(res => res.data)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const licenses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">授权交易</h1>
          <p className="text-gray-600">管理知识产权的授权和转让</p>
        </div>
        <HelpTooltip
          mode="click"
          title="授权交易说明"
          content="授权交易允许您将知识产权授权给他人使用，支持非独占、独占、排他等多种授权类型。交易通过区块链NFT记录，确保透明可追溯。"
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">关联资产</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">授权类型</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">授权费用</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic: any) => (
                <tr key={lic.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">{lic.asset?.fileName || '未知'}</td>
                  <td className="py-4 px-4">
                    {lic.licenseType === 'non_exclusive' ? '非独占' :
                     lic.licenseType === 'exclusive' ? '独占' :
                     lic.licenseType === 'sole' ? '排他' : lic.licenseType}
                  </td>
                  <td className="py-4 px-4">¥{lic.price?.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lic.status === 'active' ? 'bg-green-100 text-green-700' :
                      lic.status === 'listed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {lic.status === 'active' ? '生效中' :
                       lic.status === 'listed' ? '待售' : '其他'}
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

