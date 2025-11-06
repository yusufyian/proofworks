import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { workOrderApi } from '../api/workOrder';
import { ArrowLeft, Link } from 'lucide-react';
import { format } from 'date-fns';

export default function WorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['work-order', id],
    () => workOrderApi.getById(id!),
    { enabled: !!id }
  );

  const workOrder = data?.data;

  if (isLoading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!workOrder) {
    return <div className="text-center py-12">工单不存在</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/work-orders')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回工单列表</span>
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{workOrder.workOrderNumber}</h1>
            <p className="text-gray-600">设备：{workOrder.equipmentName}</p>
          </div>
          {workOrder.blockchainTxHash && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">已上链存证</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">故障描述</dt>
                <dd className="font-medium">{workOrder.faultDescription}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">优先级</dt>
                <dd className="font-medium">{workOrder.priority}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">状态</dt>
                <dd className="font-medium">{workOrder.status}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">报修人</dt>
                <dd className="font-medium">{workOrder.createdByName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">维修工</dt>
                <dd className="font-medium">{workOrder.assignedToName || '未分配'}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">时间信息</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">创建时间</dt>
                <dd className="font-medium">{format(new Date(workOrder.createdAt), 'yyyy-MM-dd HH:mm')}</dd>
              </div>
              {workOrder.assignedAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">分配时间</dt>
                  <dd className="font-medium">{format(new Date(workOrder.assignedAt), 'yyyy-MM-dd HH:mm')}</dd>
                </div>
              )}
              {workOrder.completedAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">完成时间</dt>
                  <dd className="font-medium">{format(new Date(workOrder.completedAt), 'yyyy-MM-dd HH:mm')}</dd>
                </div>
              )}
              {workOrder.downtimeMinutes && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">停机时长</dt>
                  <dd className="font-medium">{workOrder.downtimeMinutes} 分钟</dd>
                </div>
              )}
            </dl>
          </div>

          {workOrder.repairDescription && (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">维修记录</h3>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-700">{workOrder.repairDescription}</p>
                {workOrder.replacedParts && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">更换部件：</p>
                    <div className="flex flex-wrap gap-2">
                      {workOrder.replacedParts.map((part: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-white rounded-lg text-sm border">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

