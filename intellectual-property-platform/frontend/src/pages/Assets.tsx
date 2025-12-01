import { useQuery } from 'react-query';
import { assetsApi } from '../api/assets';
import { Plus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import HelpTooltip from '../components/HelpTooltip';

export default function Assets() {
  const { data, isLoading } = useQuery('assets', () => assetsApi.getAll({ page: 1, pageSize: 100 }));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const assets = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">确权存证</h1>
          <p className="text-gray-600">管理您的知识产权资产</p>
        </div>
        <div className="flex items-center space-x-2">
          <HelpTooltip
            mode="click"
            title="确权存证说明"
            content="确权存证是指将您的知识产权作品（设计图纸、创意素材、技术文档等）通过区块链技术进行存证，获得不可篡改的时间戳和权属证明。"
          />
          <button className="btn-primary flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>新增存证</span>
          </button>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">证书编号</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">资产类型</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">文件名</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">创建时间</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset: any) => (
                <tr key={asset.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">{asset.certificateId}</td>
                  <td className="py-4 px-4">{asset.assetType}</td>
                  <td className="py-4 px-4">{asset.fileName}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      asset.status === 'registered' ? 'bg-green-100 text-green-700' :
                      asset.status === 'licensed' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {asset.status === 'registered' ? '已注册' :
                       asset.status === 'licensed' ? '已授权' :
                       asset.status === 'transferred' ? '已转让' : '已过期'}
                    </span>
                  </td>
                  <td className="py-4 px-4">{new Date(asset.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-4">
                    <Link to={`/assets/${asset.id}`} className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1">
                      <span>查看</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
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

