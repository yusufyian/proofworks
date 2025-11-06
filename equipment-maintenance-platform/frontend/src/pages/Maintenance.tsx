import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function Maintenance() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery(
    ['maintenance-plans', statusFilter],
    async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/maintenance', { params });
      return res.data;
    }
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: any }> = {
      scheduled: { color: 'bg-blue-100 text-blue-800', text: '已计划', icon: Calendar },
      overdue: { color: 'bg-red-100 text-red-800', text: '超期', icon: AlertTriangle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', text: '进行中', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', text: '已完成', icon: CheckCircle },
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status, icon: Calendar };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} flex items-center space-x-1`}>
        <config.icon className="w-3 h-3" />
        <span>{config.text}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">维保计划</h1>
          <p className="text-gray-600">预防性维护计划管理与跟踪</p>
        </div>
        <div className="flex items-center space-x-3">
          <HelpTooltip
            content="维保计划管理系统用于制定和管理设备的预防性维护计划。系统支持基于日历时间、运行时长或工作循环次数的维保计划。当维保到期时，系统会自动生成工单并提醒相关人员。"
            title="维保计划管理"
          />
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <select
          className="input w-full md:w-64"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">全部状态</option>
          <option value="scheduled">已计划</option>
          <option value="overdue">超期</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
        </select>
      </div>

      {/* 维保计划列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.plans || []).map((plan: any) => (
            <div key={plan.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.equipmentName}</h3>
                  <p className="text-sm text-gray-500">设备编号: {plan.equipmentNo}</p>
                </div>
                {getStatusBadge(plan.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">计划类型:</span>
                  <span className="ml-2 font-medium">{plan.planType === 'preventive' ? '预防性维护' : '纠正性维护'}</span>
                </div>
                <div>
                  <span className="text-gray-600">上次维保:</span>
                  <span className="ml-2 font-medium">
                    {plan.lastMaintenanceDate ? format(new Date(plan.lastMaintenanceDate), 'yyyy-MM-dd') : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">下次维保:</span>
                  <span className={`ml-2 font-medium ${
                    plan.status === 'overdue' ? 'text-red-600' : ''
                  }`}>
                    {format(new Date(plan.nextMaintenanceDate), 'yyyy-MM-dd')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-600">维保任务: </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {plan.tasks.slice(0, 3).map((task: any) => (
                    <span key={task.id} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      {task.name}
                    </span>
                  ))}
                  {plan.tasks.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      +{plan.tasks.length - 3} 项
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.plans || data.plans.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>暂无维保计划</p>
        </div>
      )}
    </div>
  );
}