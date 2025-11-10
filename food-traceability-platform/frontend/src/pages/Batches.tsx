import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { batchApi, Batch } from '../api/batches';
import { productApi } from '../api/products';
import HelpTooltip from '../components/HelpTooltip';
import { Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Batches: React.FC = () => {
  const [batches, setBatches] = useState<(Batch & { productName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadBatches();
  }, [statusFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      
      const result = await batchApi.getBatches(params);
      const batches = result.data || [];
      const batchesWithProducts = await Promise.all(
        batches.map(async (batch: Batch) => {
          try {
            const productResult = await productApi.getProduct(batch.productId);
            return { ...batch, productName: productResult.data.name };
          } catch {
            return { ...batch, productName: '未知产品' };
          }
        })
      );
      setBatches(batchesWithProducts);
    } catch (error) {
      console.error('Failed to load batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['生产中', '合格', '不合格', '已召回', '已售罄'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">批次管理</h1>
            <p className="text-gray-600 mt-1">查看和管理产品批次信息</p>
          </div>
        </div>

        {/* 筛选 */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有状态</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <HelpTooltip 
              mode="click"
              title="批次状态筛选"
              content="筛选不同状态的批次，包括生产中、合格、不合格、已召回、已售罄等状态。" 
            />
          </div>
        </div>

        {/* 批次列表 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold">产品名称</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">批次号</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">生产日期</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">数量</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">状态</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">质检报告</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                        {batch.productName || '未知产品'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                        {batch.batchNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {batch.productionDate}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {batch.quantity} {batch.unit}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          batch.status === '合格' ? 'bg-green-100 text-green-800' :
                          batch.status === '生产中' ? 'bg-blue-100 text-blue-800' :
                          batch.status === '不合格' ? 'bg-red-100 text-red-800' :
                          batch.status === '已召回' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {batch.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {batch.qualityReports.length} 份
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to={`/trace/batch/${batch.id}`}
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>查看追溯</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && batches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的批次
          </div>
        )}
      </div>
    </Layout>
  );
};

