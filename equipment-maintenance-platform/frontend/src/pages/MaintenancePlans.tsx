import { useQuery } from 'react-query';
import { maintenanceApi } from '../api/maintenance';
import { ClipboardList, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function MaintenancePlans() {
  const { data, isLoading } = useQuery(
    'maintenance-plans',
    () => maintenanceApi.getPlans({ limit: 50 })
  );

  const plans = data?.data?.plans || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold gradient-text mb-2">维保计划</h1>
              <HelpTooltip
                mode="click"
                title="维保计划"
                content="维保计划系统根据设备类型和使用情况，自动生成预防性维护计划。包括日常保养、一级保养、二级保养等不同级别的维保任务，确保设备在最佳状态下运行。"
              />
            </div>
            <p className="text-gray-600 text-lg">查看和执行设备维保计划</p>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">加载中...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无维保计划</div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan: any) => (
              <div
                key={plan.id}
                className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <ClipboardList className="w-6 h-6 text-primary-600" />
                      <h3 className="text-lg font-semibold">{plan.equipmentNumber}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-800">
                        {plan.type === 'daily' ? '日常保养' : plan.type === 'level1' ? '一级保养' : '二级保养'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">保养周期：{plan.cycle === 'daily' ? '每日' : plan.cycleDays + '天'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>下次维保：{format(new Date(plan.nextMaintenanceDate), 'yyyy-MM-dd')}</span>
                      </div>
                    </div>
                    {plan.tasks && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">维保任务：</p>
                        <div className="flex flex-wrap gap-2">
                          {plan.tasks.map((task: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-lg text-sm">
                              {task}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

