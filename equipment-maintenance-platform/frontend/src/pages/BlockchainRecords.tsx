import { useState } from 'react';
import { useQuery } from 'react-query';
import { blockchainApi } from '../api/blockchain';
import { Cpu, Link, Search, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

const operationMap: Record<string, { label: string; color: string }> = {
  EQUIPMENT_CREATE: { label: '设备创建', color: 'bg-blue-100 text-blue-800' },
  MAINTENANCE_RECORD: { label: '维保记录', color: 'bg-green-100 text-green-800' },
  WORK_ORDER_CREATE: { label: '工单创建', color: 'bg-orange-100 text-orange-800' },
  WORK_ORDER_COMPLETE: { label: '工单完成', color: 'bg-purple-100 text-purple-800' },
};

export default function BlockchainRecords() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery(
    ['blockchain-records', page],
    () => blockchainApi.getRecords({ page, limit: 20 })
  );

  const records = data?.data?.records || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-start space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-4xl font-bold gradient-text mb-2">区块链存证</h1>
              <HelpTooltip
                mode="click"
                title="区块链存证"
                content="所有关键操作（设备创建、维保记录、工单等）都会通过区块链技术进行存证，确保数据的不可篡改性和可追溯性。每条记录都有唯一的交易哈希和区块哈希，可以通过这些哈希值在区块链上验证数据的真实性。"
              />
            </div>
            <p className="text-gray-600 text-lg">查看所有区块链存证记录</p>
          </div>
        </div>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">加载中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无存证记录</div>
        ) : (
          <div className="space-y-4">
            {records.map((record: any) => {
              const opInfo = operationMap[record.operation] || { label: record.operation, color: 'bg-gray-100 text-gray-800' };
              
              return (
                <div
                  key={record.txHash}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Cpu className="w-6 h-6 text-primary-600" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-lg ${opInfo.color}`}>
                          {opInfo.label}
                        </span>
                        {record.status === 'confirmed' && (
                          <span className="flex items-center space-x-1 text-green-600 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>已确认</span>
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">交易哈希：</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {record.txHash.substring(0, 20)}...
                            </code>
                            <Link className="w-4 h-4 text-primary-600" />
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">区块哈希：</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              {record.blockHash.substring(0, 20)}...
                            </code>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">时间戳：</span>
                          <span className="font-medium ml-2">
                            {format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">数据哈希：</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono ml-2">
                            {record.dataHash.substring(0, 16)}...
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

