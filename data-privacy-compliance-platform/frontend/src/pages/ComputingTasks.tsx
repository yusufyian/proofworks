import { useState } from 'react';
import { useQuery } from 'react-query';
import { computingTaskApi } from '../api/computingTasks';
import { Cpu, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function ComputingTasks() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const { data, isLoading } = useQuery(
    ['computing-tasks', page, status, method],
    () => computingTaskApi.getComputingTasks({ page, limit: 20, status, method })
  );

  const tasks = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: '待执行' },
      running: { icon: Cpu, color: 'bg-blue-100 text-blue-700', label: '执行中' },
      completed: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: '已完成' },
      failed: { icon: XCircle, color: 'bg-red-100 text-red-700', label: '失败' },
      cancelled: { icon: AlertCircle, color: 'bg-gray-100 text-gray-700', label: '已取消' },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      MPC: 'bg-purple-100 text-purple-700',
      TEE: 'bg-indigo-100 text-indigo-700',
      FederatedLearning: 'bg-blue-100 text-blue-700',
      DifferentialPrivacy: 'bg-green-100 text-green-700',
      PSI: 'bg-pink-100 text-pink-700',
    };
    return colors[method] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Cpu className="w-8 h-8 text-indigo-600" />
            <span>隐私计算</span>
            <HelpTooltip 
              title="隐私计算" 
              content="隐私计算页面展示所有隐私计算任务，包括MPC多方安全计算、TEE可信执行环境、联邦学习、差分隐私等计算任务。所有计算过程和结果都会上链存证。"
              mode="click"
            />
          </h1>
          <p className="text-gray-600 mt-2">管理和查看隐私计算任务</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有状态</option>
            <option value="pending">待执行</option>
            <option value="running">执行中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有方法</option>
            <option value="MPC">MPC多方安全计算</option>
            <option value="TEE">TEE可信执行环境</option>
            <option value="FederatedLearning">联邦学习</option>
            <option value="DifferentialPrivacy">差分隐私</option>
            <option value="PSI">PSI隐私集合求交</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {tasks.map((task: any) => {
                const statusBadge = getStatusBadge(task.status);
                const StatusIcon = statusBadge.icon;
                return (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${statusBadge.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{statusBadge.label}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodBadge(task.method)}`}>
                            {task.method}
                          </span>
                          {task.blockchainHash && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                              已上链
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span>发起方: {task.initiatorName} ({task.initiatorOrg})</span>
                          <span>参与方: {task.participantsInfo?.map((p: any) => p.name).join(', ')}</span>
                          <span>创建时间: {format(new Date(task.createdAt), 'yyyy-MM-dd HH:mm')}</span>
                        </div>
                        {task.result && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-800">计算结果:</p>
                            <pre className="text-xs text-green-700 mt-1">{JSON.stringify(task.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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

