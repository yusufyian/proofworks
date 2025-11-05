import { useQuery } from 'react-query';
import { devicesApi } from '../api/devices';
import { Cpu, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function Devices() {
  const { data, isLoading } = useQuery('devices', () => devicesApi.getDevices());
  const devices = data?.data || [];

  const statusColors: Record<string, string> = {
    online: 'bg-green-100 text-green-700',
    offline: 'bg-red-100 text-red-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
  };

  const statusLabels: Record<string, string> = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
  };

  const typeLabels: Record<string, string> = {
    warehouse: '冷库监控',
    vehicle: '车载设备',
    portable: '便携设备',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">设备管理</h1>
          <p className="text-gray-600 mt-1">管理所有温控监测设备</p>
        </div>
        <HelpTooltip
          mode="click"
          title="设备管理说明"
          content="设备管理用于管理所有温控监测设备，包括冷库监控系统、车载设备和便携设备。设备需要定期校准（每6个月），系统会自动提醒即将到期的校准。设备状态分为在线、离线和维护中三种。离线设备无法采集数据，需要及时处理。"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : (
          devices.map((device: any) => (
            <div
              key={device.id}
              className="card hover:shadow-2xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    device.status === 'online' ? 'bg-green-100' :
                    device.status === 'offline' ? 'bg-red-100' :
                    'bg-yellow-100'
                  }`}>
                    <Cpu className={`w-6 h-6 ${
                      device.status === 'online' ? 'text-green-600' :
                      device.status === 'offline' ? 'text-red-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{device.name}</h3>
                    <p className="text-sm text-gray-500">{device.deviceId}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[device.status] || 'bg-gray-100'}`}>
                  {statusLabels[device.status] || device.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">设备类型</span>
                  <span className="font-medium">{typeLabels[device.type] || device.type}</span>
                </div>
                {device.location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">位置</span>
                    <span className="font-medium">{device.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">上次校准</span>
                  <span className="font-medium">{format(new Date(device.calibrationDate), 'yyyy-MM-dd')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">下次校准</span>
                  <span className={`font-medium ${
                    new Date(device.nextCalibrationDate) < new Date() ? 'text-red-600' :
                    new Date(device.nextCalibrationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-yellow-600' :
                    'text-gray-900'
                  }`}>
                    {format(new Date(device.nextCalibrationDate), 'yyyy-MM-dd')}
                  </span>
                </div>
                {new Date(device.nextCalibrationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                  <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>校准即将到期</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {devices.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Cpu className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>暂无设备数据</p>
          </div>
        )}
      </div>
    </div>
  );
}



