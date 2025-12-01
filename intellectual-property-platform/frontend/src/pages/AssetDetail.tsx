import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { assetsApi } from '../api/assets';
import { ShieldCheck, FileText, Clock } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function AssetDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(['asset', id], () => assetsApi.getById(id!));

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const asset = data?.data;

  if (!asset) {
    return <div>资产不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">资产详情</h1>
          <p className="text-gray-600">确权存证详细信息</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>基本信息</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">证书编号</label>
              <p className="font-semibold">{asset.certificateId}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">资产类型</label>
              <p className="font-semibold">{asset.assetType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">文件名</label>
              <p className="font-semibold">{asset.fileName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">文件大小</label>
              <p className="font-semibold">{(asset.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">状态</label>
              <p className="font-semibold">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  asset.status === 'registered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {asset.status === 'registered' ? '已注册' : '其他'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5" />
            <span>区块链存证</span>
            <HelpTooltip
              mode="hover"
              title="区块链存证"
              content="您的资产已通过区块链技术进行存证，确保数据的不可篡改性和时间戳的可信性。"
            />
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">区块链</label>
              <p className="font-semibold">{asset.blockchain.chain}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">交易哈希</label>
              <p className="font-mono text-xs break-all">{asset.blockchain.txHash}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">区块高度</label>
              <p className="font-semibold">{asset.blockchain.blockHeight}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">文件哈希</label>
              <p className="font-mono text-xs break-all">{asset.fileHash}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>存证时间</span>
              </label>
              <p className="font-semibold">{new Date(asset.timestamp.time).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

