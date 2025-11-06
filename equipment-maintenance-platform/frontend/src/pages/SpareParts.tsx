import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Package, AlertTriangle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

export default function SpareParts() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useQuery(
    ['spare-parts', search, lowStockOnly],
    async () => {
      const params: any = {};
      if (search) params.search = search;
      if (lowStockOnly) params.lowStock = 'true';
      const res = await api.get('/spare-parts', { params });
      return res.data;
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">备件管理</h1>
          <p className="text-gray-600">备件库存管理与采购计划</p>
        </div>
        <div className="flex items-center space-x-3">
          <HelpTooltip
            content="备件管理系统用于管理维修所需的备件库存。系统支持ABC分类管理，自动预警低库存备件，并提供备件与设备的关联关系，方便快速查找所需备件。"
            title="备件管理"
          />
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="搜索备件名称、编号..."
            className="input md:col-span-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">仅显示低库存</span>
          </label>
        </div>
      </div>

      {/* 备件列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.parts || []).map((part: any) => (
            <div key={part.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{part.name}</h3>
                    <p className="text-sm text-gray-500">{part.partNo}</p>
                  </div>
                </div>
                {part.currentStock <= part.minStock && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">当前库存:</span>
                  <span className={`font-semibold ${
                    part.currentStock <= part.minStock ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {part.currentStock} {part.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最低库存:</span>
                  <span className="font-medium">{part.minStock} {part.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">单价:</span>
                  <span className="font-medium">¥{part.unitPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">分类:</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                    {part.abcClass}类
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}