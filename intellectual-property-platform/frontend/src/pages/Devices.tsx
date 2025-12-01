import { useQuery } from 'react-query';
import { apiClient } from '../api/client';
import HelpTooltip from '../components/HelpTooltip';

export default function Devices() {
  const { data, isLoading } = useQuery('devices', () => 
    apiClient.get('/devices', { params: { page: 1, pageSize: 100 } }).then(res => res.data)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const devices = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">设备台账</h1>
          <p className="text-gray-600">管理实体设备的数字孪生记录</p>
        </div>
        <HelpTooltip
          mode="click"
          title="设备台账说明"
          content="设备台账通过区块链NFT记录实体设备的全生命周期信息，包括采购、使用、转移、报废等关键事件，确保设备权属清晰可追溯。"
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-700">设备名称</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">设备类型</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">序列号</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">原值</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">状态</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: any) => (
                <tr key={device.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">{device.name}</td>
                  <td className="py-4 px-4">{device.assetType}</td>
                  <td className="py-4 px-4">{device.serialNumber}</td>
                  <td className="py-4 px-4">¥{device.originalValue?.toLocaleString()}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      device.status === 'normal' ? 'bg-green-100 text-green-700' :
                      device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {device.status === 'normal' ? '正常' :
                       device.status === 'maintenance' ? '维修中' : '其他'}
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

