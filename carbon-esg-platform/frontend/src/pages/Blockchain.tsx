import { useQuery } from 'react-query';
import { blockchainApi } from '../api/blockchain';
import { Link2, Shield, Copy, CheckCircle2, FileText, Leaf, TrendingDown, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import HelpTooltip from '../components/HelpTooltip';

export default function Blockchain() {
  const { data, isLoading, refetch } = useQuery('blockchain-records', blockchainApi.getRecords);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const records = data?.data || [];

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return FileText;
      case 'product':
        return Leaf;
      case 'reduction_project':
        return TrendingDown;
      case 'esg_report':
        return Award;
      default:
        return Shield;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'inventory':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'product':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'reduction_project':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'esg_report':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const formatHash = (hash: string) => {
    if (!hash) return '-';
    return `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">区块链存证</h1>
          <p className="text-gray-600">查看所有已上链的碳足迹和ESG数据存证记录</p>
        </div>
        <HelpTooltip
          mode="click"
          title="区块链存证说明"
          content="所有经过核证或认证的碳数据都会自动上链存证，生成唯一的交易哈希（Transaction Hash）。区块链存证具有不可篡改、可追溯的特性，可有效证明数据的真实性和时间戳。您可以通过交易哈希在区块链浏览器上查询存证记录。"
        />
      </div>

      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">存证记录</h2>
              <p className="text-sm text-gray-500">共 {records.length} 条已上链记录</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无区块链存证记录</p>
            <p className="text-sm mt-2">核证或认证后的数据将自动上链存证</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record: any) => {
              const Icon = getResourceTypeIcon(record.resourceType);
              const isCopied = copiedHash === record.hash;

              return (
                <div
                  key={`${record.resourceType}-${record.id}`}
                  className={`border-2 ${getResourceTypeColor(record.resourceType)} rounded-xl p-6 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-3 rounded-xl bg-white/80 shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border`}>
                            {record.resourceTypeName}
                          </span>
                          {record.certificationNumber && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/60 border border-white/80">
                              证书号: {record.certificationNumber}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">{record.title}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 min-w-[100px]">交易哈希:</span>
                            <code className="flex-1 bg-white/60 px-3 py-1.5 rounded-lg font-mono text-sm border border-white/80 break-all">
                              {formatHash(record.hash)}
                            </code>
                            <button
                              onClick={() => handleCopyHash(record.hash)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                isCopied
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-white/60 hover:bg-white/80 text-gray-700'
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                                  已复制
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 inline mr-1" />
                                  复制
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>存证时间:</span>
                            <span>{format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-700">已上链</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">区块链存证说明</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>所有通过第三方核证或认证的数据都会自动上链存证，生成唯一交易哈希</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>区块链存证确保数据不可篡改，可永久追溯和验证</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>您可以通过交易哈希在区块链浏览器查询详细的存证信息</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-0.5">•</span>
                <span>存证记录可用于第三方验证、监管报送、ESG评级等场景</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
