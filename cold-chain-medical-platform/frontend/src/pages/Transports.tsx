import { useQuery } from 'react-query';
import { transportsApi } from '../api/transports';
import { Truck, Package, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function Transports() {
  const { data, isLoading } = useQuery('transports', () => transportsApi.getTransports());
  const transports = data?.data || [];

  const statusColors: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    in_transit: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-200 text-gray-800',
  };

  const statusLabels: Record<string, string> = {
    pending: '待发车',
    in_transit: '运输中',
    delivered: '已送达',
    rejected: '已拒收',
    cancelled: '已取消',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">运输管理</h1>
          <p className="text-gray-600 mt-1">管理所有冷链运输单</p>
        </div>
        <HelpTooltip
          mode="click"
          title="运输管理说明"
          content="运输管理用于跟踪和管理所有冷链运输单。每个运输单包含起点、终点、运输批次、司机信息等。系统会实时监控运输过程中的温控数据，确保药品在运输过程中符合温控要求。合规评分反映了运输过程中温控数据的合规程度。"
        />
      </div>

      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {transports.map((transport: any) => (
              <div
                key={transport.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Truck className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{transport.transportNo}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[transport.status] || 'bg-gray-100'}`}>
                            {statusLabels[transport.status] || transport.status}
                          </span>
                          {transport.complianceScore !== undefined && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transport.complianceScore >= 95 ? 'bg-green-100 text-green-700' :
                              transport.complianceScore >= 85 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              合规评分: {transport.complianceScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>起点：{transport.fromCompanyName}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>终点：{transport.toCompanyName}</span>
                        </div>
                        {transport.route && (
                          <div className="text-gray-600">
                            <span className="font-medium">路线：</span>
                            {transport.route.start.name} → {transport.route.end.name}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {transport.driverName && (
                          <div className="text-gray-600">
                            <span className="font-medium">司机：</span>
                            {transport.driverName} ({transport.driverPhone})
                          </div>
                        )}
                        <div className="text-gray-600">
                          <span className="font-medium">批次数量：</span>
                          {transport.batchCount || transport.batchIds?.length || 0} 个批次
                        </div>
                        <div className="text-gray-600">
                          <span className="font-medium">发车时间：</span>
                          {format(new Date(transport.startTime), 'yyyy-MM-dd HH:mm')}
                        </div>
                        {transport.endTime && (
                          <div className="text-gray-600">
                            <span className="font-medium">到达时间：</span>
                            {format(new Date(transport.endTime), 'yyyy-MM-dd HH:mm')}
                          </div>
                        )}
                      </div>
                    </div>
                    {transport.batches && transport.batches.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">运输批次：</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {transport.batches.map((batch: any) => (
                            <span
                              key={batch.id}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                            >
                              {batch.batchNo} - {batch.productName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {transports.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无运输单数据</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



