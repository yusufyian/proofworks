import { useState } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { Cpu, Plus, Search, Filter, HelpCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import CreateEquipmentModal from '../components/CreateEquipmentModal';

export default function Equipment() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useQuery(
    ['equipment', statusFilter, categoryFilter, search],
    async () => {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;
      const res = await api.get('/equipment', { params });
      return res.data;
    }
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      normal: { color: 'bg-green-100 text-green-800', text: '正常' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', text: '待维保' },
      repair: { color: 'bg-orange-100 text-orange-800', text: '维修中' },
      scrapped: { color: 'bg-red-100 text-red-800', text: '已报废' },
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getHealthBadge = (score?: number) => {
    if (!score) return <span className="text-gray-400">-</span>;
    if (score >= 90) return <span className="text-green-600 font-semibold">优秀</span>;
    if (score >= 70) return <span className="text-blue-600 font-semibold">良好</span>;
    if (score >= 50) return <span className="text-yellow-600 font-semibold">一般</span>;
    return <span className="text-red-600 font-semibold">差</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">设备台账</h1>
          <p className="text-gray-600">管理和查看所有设备信息</p>
        </div>
        <div className="flex items-center space-x-3">
          <HelpTooltip
            content="设备台账管理系统用于记录和管理企业的所有设备信息，包括设备基本信息、采购信息、位置信息、责任人等。系统支持设备的全生命周期管理，从采购入库到报废的全过程记录。"
            title="设备台账管理"
          />
          <button 
            className="btn-primary flex items-center space-x-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            <span>新增设备</span>
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索设备编号、名称或型号..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="maintenance">待维保</option>
            <option value="repair">维修中</option>
            <option value="scrapped">已报废</option>
          </select>
          <select
            className="input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">全部类别</option>
            <option value="数控机床">数控机床</option>
            <option value="注塑设备">注塑设备</option>
            <option value="焊接设备">焊接设备</option>
            <option value="空压设备">空压设备</option>
            <option value="叉车">叉车</option>
            <option value="检测设备">检测设备</option>
          </select>
        </div>
      </div>

      {/* 设备列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data?.equipment || []).map((eq: any) => (
            <div key={eq.id} className="card hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{eq.name}</h3>
                    <p className="text-sm text-gray-500">{eq.equipmentNo}</p>
                  </div>
                </div>
                {getStatusBadge(eq.status)}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">型号:</span>
                  <span className="font-medium">{eq.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">类别:</span>
                  <span className="font-medium">{eq.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">位置:</span>
                  <span className="font-medium">{eq.location.workshop} - {eq.location.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">健康度:</span>
                  {getHealthBadge(eq.healthScore)}
                </div>
                {eq.blockchainHash && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-blue-600">✓ 已上链存证</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium">
                  查看详情 →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data?.equipment || data.equipment.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <Cpu className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>暂无设备数据</p>
        </div>
      )}

      {/* 新增设备弹窗 */}
      <CreateEquipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}