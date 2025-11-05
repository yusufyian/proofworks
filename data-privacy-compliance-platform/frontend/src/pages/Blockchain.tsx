import { useState } from 'react';
import { useQuery } from 'react-query';
import { blockchainApi } from '../api/blockchain';
import { Link2, Shield, Cpu, FileCheck } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function Blockchain() {
  const [page, setPage] = useState(1);
  const [recordType, setRecordType] = useState('');
  const { data, isLoading } = useQuery(
    ['blockchain', page, recordType],
    () => blockchainApi.getBlockchainRecords({ page, limit: 20, recordType })
  );

  const records = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const getRecordTypeIcon = (type: string) => {
    const icons = {
      authorization: Shield,
      computing: Cpu,
      audit: FileCheck,
    };
    return icons[type as keyof typeof icons] || Link2;
  };

  const getRecordTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      authorization: '授权记录',
      computing: '计算任务',
      audit: '审计记录',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Link2 className="w-8 h-8 text-indigo-600" />
            <span>区块链存证</span>
            <HelpTooltip 
              title="区块链存证" 
              content="区块链存证页面展示所有上链存证的记录，包括授权记录和计算任务的存证信息。所有存证记录都包含区块高度、交易哈希等信息，确保数据的不可篡改性和可追溯性。"
              mode="click"
            />
          </h1>
          <p className="text-gray-600 mt-2">查看区块链存证记录</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
          >
            <option value="">所有类型</option>
            <option value="authorization">授权记录</option>
            <option value="computing">计算任务</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {records.map((record: any) => {
                const Icon = getRecordTypeIcon(record.recordType);
                return (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Icon className="w-5 h-5 text-indigo-600" />
                          </div>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {getRecordTypeLabel(record.recordType)}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">记录ID:</span>
                            <span className="font-mono text-gray-900">{record.recordId}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">哈希值:</span>
                            <span className="font-mono text-gray-900 text-xs">{record.hash}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">区块高度:</span>
                            <span className="font-mono text-gray-900">{record.blockHeight?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">交易哈希:</span>
                            <span className="font-mono text-gray-900 text-xs">{record.transactionHash}</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">存证时间:</span>
                            <span className="text-gray-900">{format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss')}</span>
                          </div>
                        </div>
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

