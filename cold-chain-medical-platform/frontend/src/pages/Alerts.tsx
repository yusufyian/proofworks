import { useState } from 'react';
import { useQuery } from 'react-query';
import { alertsApi } from '../api/alerts';
import { AlertTriangle, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function Alerts() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  
  const { data, isLoading } = useQuery(
    ['alerts', statusFilter, levelFilter],
    () => alertsApi.getAlerts({
      status: statusFilter || undefined,
      level: levelFilter || undefined,
    })
  );

  const alerts = data?.data || [];

  const levelColors: Record<string, string> = {
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    serious: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  const levelLabels: Record<string, string> = {
    warning: '预警',
    serious: '严重',
    critical: '紧急',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-red-100 text-red-700',
    acknowledged: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
    false_alarm: 'bg-gray-100 text-gray-700',
  };

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    acknowledged: '已确认',
    resolved: '已解决',
    false_alarm: '误报',
  };

  const handleUpdateAlert = async (id: string, status: string) => {
    await alertsApi.updateAlert(id, { status });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">告警管理</h1>
          <p className="text-gray-600 mt-1">管理所有温控异常告警</p>
        </div>
        <HelpTooltip
          mode="click"
          title="告警管理说明"
          content="告警管理用于监控和处理所有温控异常情况。告警分为三个级别：预警（黄色）、严重（橙色）、紧急（红色）。系统会自动检测温度超标、设备故障、开门异常等情况并生成告警。告警需要在规定时间内响应和处理。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              className="input"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="">全部级别</option>
              <option value="warning">预警</option>
              <option value="serious">严重</option>
              <option value="critical">紧急</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="acknowledged">已确认</option>
              <option value="resolved">已解决</option>
              <option value="false_alarm">误报</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert: any) => (
              <div
                key={alert.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${levelColors[alert.level] || 'bg-gray-100'}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${levelColors[alert.level] || 'bg-gray-100'}`}>
                            {levelLabels[alert.level] || alert.level}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[alert.status] || 'bg-gray-100'}`}>
                            {statusLabels[alert.status] || alert.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mt-2">{alert.message}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      {alert.batchNo && (
                        <div>
                          <span className="text-gray-500">批次号：</span>
                          <span className="font-medium">{alert.batchNo}</span>
                        </div>
                      )}
                      {alert.productName && (
                        <div>
                          <span className="text-gray-500">产品：</span>
                          <span className="font-medium">{alert.productName}</span>
                        </div>
                      )}
                      {alert.deviceName && (
                        <div>
                          <span className="text-gray-500">设备：</span>
                          <span className="font-medium">{alert.deviceName}</span>
                        </div>
                      )}
                      {alert.temperature !== undefined && (
                        <div>
                          <span className="text-gray-500">温度：</span>
                          <span className="font-medium text-red-600">{alert.temperature}°C</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">持续时间：</span>
                        <span className="font-medium">{alert.duration}分钟</span>
                      </div>
                      <div>
                        <span className="text-gray-500">发生时间：</span>
                        <span className="font-medium">{format(new Date(alert.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  {alert.status === 'pending' && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleUpdateAlert(alert.id, 'acknowledged')}
                        className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                      >
                        确认
                      </button>
                      <button
                        onClick={() => handleUpdateAlert(alert.id, 'resolved')}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        已解决
                      </button>
                      <button
                        onClick={() => handleUpdateAlert(alert.id, 'false_alarm')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        误报
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>暂无告警数据</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



