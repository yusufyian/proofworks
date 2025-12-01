import { useState } from 'react';
import { useQuery } from 'react-query';
import { batchesApi } from '../api/batches';
import { Package, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function Batches() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery(
    ['batches', statusFilter, search],
    () => batchesApi.getBatches({ status: statusFilter || undefined, search })
  );

  const batches = data?.data || [];

  const statusColors: Record<string, string> = {
    in_storage: 'bg-green-100 text-green-700',
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-gray-100 text-gray-700',
    isolated: 'bg-red-100 text-red-700',
    destroyed: 'bg-gray-200 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    in_storage: '在库',
    in_transit: '在途',
    delivered: '已交付',
    isolated: '已隔离',
    destroyed: '已销毁',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">批次管理</h1>
          <p className="text-gray-600 mt-1">管理所有药品批次信息</p>
        </div>
        <HelpTooltip
          mode="click"
          title="批次管理说明"
          content="批次管理用于跟踪和管理所有药品批次。每个批次包含产品信息、生产日期、有效期、温控要求等关键信息。您可以查看批次的详细温控数据和合规状态。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索批次号、产品名称或追溯码..."
              className="input pl-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="in_storage">在库</option>
              <option value="in_transit">在途</option>
              <option value="delivered">已交付</option>
              <option value="isolated">已隔离</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">批次号</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">产品名称</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">产品类型</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">生产日期</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">有效期</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">数量</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">温控范围</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">当前位置</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch: any) => (
                  <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{batch.batchNo}</div>
                      {batch.traceCode && (
                        <div className="text-xs text-gray-500 mt-1">{batch.traceCode}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium">{batch.productName}</div>
                      <div className="text-xs text-gray-500 mt-1">{batch.producerName}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{batch.productType}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {format(new Date(batch.productionDate), 'yyyy-MM-dd')}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {format(new Date(batch.expiryDate), 'yyyy-MM-dd')}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium">{batch.quantity}</span>
                      <span className="text-gray-500 ml-1">{batch.unit}</span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span className="font-medium text-primary-600">
                        {batch.temperatureRange.min}°C ~ {batch.temperatureRange.max}°C
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[batch.status] || 'bg-gray-100 text-gray-700'}`}>
                        {statusLabels[batch.status] || batch.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{batch.currentLocation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {batches.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无批次数据</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



