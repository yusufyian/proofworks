import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { analyticsApi, LogisticsAnalysis as LogisticsAnalysisData } from '../api/analytics';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { format, subDays } from 'date-fns';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Truck, Clock, MapPin, User } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const LogisticsAnalysis: React.FC = () => {
  // 默认显示从2024年6月1日开始的所有数据
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<LogisticsAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getLogisticsAnalysis({ startDate, endDate });
      if (response && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('加载物流数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">数据加载失败</div>
        </div>
      </Layout>
    );
  }

  const stayTimesData = Object.keys(data.avgStayTimes).map(key => ({
    name: key,
    value: data.avgStayTimes[key],
  }));

  const locationData = Object.entries(data.locationStats)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const operatorData = Object.entries(data.operatorStats)
    .map(([name, count]) => ({ name, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题和筛选 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">物流绩效分析</h1>
            <p className="text-gray-600 mt-1">物流环节效率与绩效深度统计</p>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* KPI卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">物流事件总量</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalLogisticsEvents}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              涵盖装车、运输、到货等环节
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">平均仓储时长</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.avgStayTimes['仓储']?.toFixed(1) || 0} 小时
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              入库至出库平均时长
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">平均运输时长</p>
                <p className="text-2xl font-bold text-orange-600">
                  {data.avgStayTimes['运输']?.toFixed(1) || 0} 小时
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              装车至到货平均时长
            </div>
          </div>
        </div>

        {/* 各环节停留时间 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">各环节平均停留时间</h3>
            <HelpTooltip
              mode="click"
              title="停留时间"
              content="统计仓储、运输、门店等各环节的平均停留时间，便于识别效率瓶颈与优化机会。"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stayTimesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: '小时', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 地点统计 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">地点活跃度 Top 10</h3>
              <HelpTooltip
                mode="click"
                title="地点活跃度"
                content="统计各地点发生的物流事件数量，识别主要流转节点与核心枢纽。"
              />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={locationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">操作员活跃度 Top 10</h3>
              <HelpTooltip
                mode="click"
                title="操作员活跃度"
                content="统计各操作员处理的物流事件数量，评估工作负荷与效率水平。"
              />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={operatorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
};

