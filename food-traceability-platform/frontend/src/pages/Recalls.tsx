import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { recallApi, Recall } from '../api/recalls';
import HelpTooltip from '../components/HelpTooltip';
import { Filter, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export const Recalls: React.FC = () => {
  const [recalls, setRecalls] = useState<Recall[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  useEffect(() => {
    loadRecalls();
  }, [statusFilter, riskFilter]);

  const loadRecalls = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (riskFilter) params.riskLevel = riskFilter;
      
      const result = await recallApi.getRecalls(params);
      setRecalls(result.data || []);
    } catch (error) {
      console.error('Failed to load recalls:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case '紧急': return 'bg-red-100 text-red-800 border-red-300';
      case '高': return 'bg-orange-100 text-orange-800 border-orange-300';
      case '中': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case '低': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">召回管理</h1>
            <p className="text-gray-600 mt-1">管理与跟踪产品召回事件</p>
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
              <option value="进行中">进行中</option>
              <option value="已完成">已完成</option>
              <option value="已取消">已取消</option>
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">所有风险等级</option>
              <option value="紧急">紧急</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
            <HelpTooltip content="筛选不同状态和风险等级的召回记录。风险等级分为紧急、高、中、低四个级别，状态包括进行中、已完成、已取消。" />
          </div>
        </div>

        {/* 召回列表 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recalls.map((recall) => (
              <div
                key={recall.id}
                className={`glass rounded-xl p-6 card-hover border-2 ${getRiskColor(recall.riskLevel)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/50 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">批次号: {recall.batchNumber}</h3>
                      <p className="text-sm text-gray-600 mt-1">{recall.reason}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(recall.riskLevel)}`}>
                    {recall.riskLevel}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">发起机构:</span>
                    <span className="font-semibold text-gray-900">{recall.initiatedBy}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">发起时间:</span>
                    <span className="font-semibold text-gray-900">
                      {format(new Date(recall.initiatedAt), 'yyyy-MM-dd HH:mm')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">状态:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recall.status === '进行中' ? 'bg-orange-100 text-orange-800' :
                      recall.status === '已完成' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {recall.status === '进行中' && <Clock className="w-3 h-3 inline mr-1" />}
                      {recall.status === '已完成' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                      {recall.status}
                    </span>
                  </div>
                </div>

                {/* 召回进度 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">召回进度</span>
                    <span className="font-semibold text-gray-900">
                      {recall.recallProgress.recalledQuantity} / {recall.recallProgress.totalQuantity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        recall.riskLevel === '紧急' ? 'bg-red-500' :
                        recall.riskLevel === '高' ? 'bg-orange-500' :
                        recall.riskLevel === '中' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}
                      style={{
                        width: `${(recall.recallProgress.recalledQuantity / recall.recallProgress.totalQuantity) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {/* 召回地点 */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">召回地点分布:</p>
                  <div className="space-y-2">
                    {recall.recallProgress.locations.map((location, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white/50 rounded">
                        <span className="text-gray-700">{location.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-600">{location.quantity} 件</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            location.status === '已召回' ? 'bg-green-100 text-green-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {location.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {recall.completedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    完成时间: {format(new Date(recall.completedAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && recalls.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            没有找到匹配的召回记录
          </div>
        )}
      </div>
    </Layout>
  );
};

