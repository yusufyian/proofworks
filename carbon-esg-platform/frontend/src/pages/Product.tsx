import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { productApi } from '../api/product';
import { blockchainApi } from '../api/blockchain';
import { Leaf, Search, Award, Link2, Copy, CheckCircle2 } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function Product() {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery('products', () => 
    productApi.getProductFootprints({ verified: verifiedFilter === 'true' ? true : verifiedFilter === 'false' ? false : undefined })
  );

  const certifyMutation = useMutation(
    (id: string) => blockchainApi.certify('product', id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        queryClient.invalidateQueries('blockchain-records');
      },
    }
  );

  const products = data?.data || [];

  const handleCertify = async (id: string) => {
    if (confirm('确认要将此产品碳足迹上链存证吗？')) {
      try {
        await certifyMutation.mutateAsync(id);
        alert('上链存证成功！');
      } catch (error: any) {
        alert(error.response?.data?.error || '上链存证失败');
      }
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };
  const filteredProducts = products.filter((p: any) => {
    if (searchTerm) {
      return p.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const getCarbonLabelBadge = (label?: string) => {
    if (!label) return null;
    const colors: Record<string, string> = {
      A: 'bg-green-100 text-green-700 border-green-300',
      B: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      C: 'bg-orange-100 text-orange-700 border-orange-300',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colors[label] || colors.C}`}>
        {label}级
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">产品碳足迹</h1>
          <p className="text-gray-600">基于生命周期评价（LCA）的产品碳排放管理</p>
        </div>
        <HelpTooltip
          mode="click"
          title="产品碳足迹说明"
          content="产品碳足迹（Product Carbon Footprint, PCF）是基于生命周期评价方法，计算产品从原材料获取、生产制造、运输分销、使用阶段到废弃处置全生命周期的碳排放。系统会根据碳足迹值自动评级：A级（<50kgCO2e）、B级（50-100kgCO2e）、C级（≥100kgCO2e）。"
        />
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索产品名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 input"
            />
          </div>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="input md:w-48"
          >
            <option value="">全部状态</option>
            <option value="true">已核证</option>
            <option value="false">未核证</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无产品碳足迹记录</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProducts.map((product: any) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{product.productName}</h3>
                  <div className="flex items-center space-x-2">
                    {getCarbonLabelBadge(product.carbonLabel)}
                    {product.verified && (
                      <Award className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">功能单位</p>
                  <p className="text-lg font-semibold text-gray-900">{product.functionalUnit}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">碳足迹总值</p>
                  <p className="text-3xl font-bold text-primary-600">{product.lcaResult?.toFixed(2)} kgCO2e</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">原材料</p>
                    <p className="text-sm font-semibold">{product.stages?.rawMaterial?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">生产制造</p>
                    <p className="text-sm font-semibold">{product.stages?.manufacturing?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">运输分销</p>
                    <p className="text-sm font-semibold">{product.stages?.transportation?.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">使用阶段</p>
                    <p className="text-sm font-semibold">{product.stages?.use?.toFixed(1)}</p>
                  </div>
                </div>

                {product.blockchainHash ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm">
                        <Link2 className="w-4 h-4 text-primary-600" />
                        <span className="text-gray-600">区块链哈希:</span>
                        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {product.blockchainHash.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() => handleCopyHash(product.blockchainHash!)}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          {copiedHash === product.blockchainHash ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">已上链</span>
                    </div>
                  </div>
                ) : product.verified ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleCertify(product.id)}
                      disabled={certifyMutation.isLoading}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Link2 className="w-4 h-4" />
                      <span>{certifyMutation.isLoading ? '上链中...' : '上链存证'}</span>
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
