import { useState } from 'react';
import { useQuery } from 'react-query';
import { auditApi } from '../api/audit';
import { FileCheck } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function Audit() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const { data, isLoading } = useQuery(
    ['audit', page, action],
    () => auditApi.getAuditRecords({ page, limit: 50, action })
  );

  const records = data?.data?.items || [];
  const total = data?.data?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <FileCheck className="w-8 h-8 text-indigo-600" />
            <span>合规审计</span>
            <HelpTooltip 
              title="合规审计" 
              content="合规审计页面展示所有系统操作记录，包括授权创建、审批、计算任务执行等。所有操作都有完整的审计日志，确保合规性和可追溯性。"
              mode="click"
            />
          </h1>
          <p className="text-gray-600 mt-2">查看系统操作审计日志</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有操作</option>
            <option value="create_authorization">创建授权</option>
            <option value="approve_authorization">审批授权</option>
            <option value="create_task">创建任务</option>
            <option value="complete_task">完成任务</option>
            <option value="view_data">查看数据</option>
            <option value="export_data">导出数据</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {records.map((record: any) => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {record.action}
                        </span>
                        <span className="text-sm text-gray-500">{record.resourceType}</span>
                      </div>
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">{record.userName}</span> ({record.userOrg})
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{record.details?.description || record.action}</p>
                      <div className="flex items-center space-x-6 text-xs text-gray-500">
                        <span>资源ID: {record.resourceId}</span>
                        <span>IP: {record.ipAddress}</span>
                        <span>{format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {total > 50 && (
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
                    disabled={page * 50 >= total}
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

