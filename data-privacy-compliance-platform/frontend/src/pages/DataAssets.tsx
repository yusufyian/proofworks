import { useState } from 'react';
import { useQuery } from 'react-query';
import { dataAssetApi } from '../api/dataAssets';
import { Database, Search, Filter, HelpCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function DataAssets() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [classification, setClassification] = useState('');
  const { data, isLoading } = useQuery(
    ['data-assets', page, category, classification],
    () => dataAssetApi.getDataAssets({ page, limit: 20, category, classification: classification ? Number(classification) : undefined })
  );

  const assets = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const getClassificationBadge = (level: number) => {
    const colors = {
      1: 'bg-gray-100 text-gray-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-yellow-100 text-yellow-700',
      4: 'bg-orange-100 text-orange-700',
      5: 'bg-red-100 text-red-700',
    };
    return colors[level as keyof typeof colors] || colors[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Database className="w-8 h-8 text-indigo-600" />
            <span>数据资产</span>
            <HelpTooltip 
              title="数据资产" 
              content="数据资产页面展示所有已注册的数据资产信息，包括数据分类级别、字段信息、记录数量等。数据提供方只能查看自己拥有的资产。"
              mode="click"
            />
          </h1>
          <p className="text-gray-600 mt-2">管理和查看所有数据资产</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索数据资产..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有类别</option>
            <option value="用户行为数据">用户行为数据</option>
            <option value="交易数据">交易数据</option>
            <option value="征信数据">征信数据</option>
            <option value="医疗健康数据">医疗健康数据</option>
          </select>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有级别</option>
            <option value="1">1级-公开数据</option>
            <option value="2">2级-一般个人信息</option>
            <option value="3">3级-敏感个人信息</option>
            <option value="4">4级-重要数据</option>
            <option value="5">5级-核心数据</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {assets.map((asset: any) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getClassificationBadge(asset.classification)}`}>
                          {asset.classification}级
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{asset.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>类别: {asset.category}</span>
                        <span>字段数: {asset.fields?.length || 0}</span>
                        <span>记录数: {asset.recordCount?.toLocaleString() || 0}</span>
                        <span>机构: {asset.organization}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {total > 20 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">共 {total} 条记录</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-sm">第 {page} 页</span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page * 20 >= total}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

