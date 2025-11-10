import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { analyticsApi, OverviewData } from '../api/analytics';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { format } from 'date-fns';
import { 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Activity, AlertCircle, Thermometer, Package, Truck, ArrowRight, BarChart3 } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import HelpTooltip from '../components/HelpTooltip';

export const Analytics: React.FC = () => {
  // 默认显示从2024年6月1日开始的所有数据（数据文件中的最早日期）
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.getOverview({ startDate, endDate });
      // API client 拦截器已经返回了 response.data，所以 response 就是 { success, data }
      if (response && response.data) {
        setOverview(response.data);
      }
    } catch (error) {
      console.error('加载概览数据失败:', error);
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

  if (!overview) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">数据加载失败</div>
        </div>
      </Layout>
    );
  }

  const { kpis, trends } = overview;

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题和筛选 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">智能数据分析</h1>
            <p className="text-gray-600 mt-1">多维度数据洞察与趋势预测分析</p>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* KPI卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">追溯覆盖率</p>
                  <HelpTooltip
                    mode="click"
                    title="追溯覆盖率"
                    content="已建立完整追溯链的产品批次占总批次的百分比。追溯覆盖率越高，表明系统追溯能力越强，目标值应≥80%。"
                  />
                </div>
                <span className="text-2xl font-bold text-primary-600">
                  <AnimatedNumber value={kpis.traceabilityCoverage} decimals={2} />%
                </span>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-gray-600">目标: ≥80%</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">质量合规率</p>
                  <HelpTooltip
                    mode="click"
                    title="质量合规率"
                    content="通过质量检测并符合标准的批次占总批次的百分比。合规率反映产品质量控制水平，是衡量企业质量管理能力的重要指标。"
                  />
                </div>
                <span className="text-2xl font-bold text-green-600">
                  <AnimatedNumber value={kpis.complianceRate} decimals={2} />%
                </span>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">合格批次比例</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">召回率</p>
                  <HelpTooltip
                    mode="click"
                    title="召回率"
                    content="因质量问题需要召回的批次占总批次的百分比。召回率越低越好，说明产品质量越稳定。当召回率较高时，需要重点关注质量控制和风险预警。"
                  />
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  <AnimatedNumber value={kpis.recallRate} decimals={2} />%
                </span>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">需重点关注批次</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">温控合规率</p>
                  <HelpTooltip
                    mode="click"
                    title="温控合规率"
                    content="温度控制在规定范围内（通常为2-8°C）的监测数据点占总数据点的百分比。温控合规率反映冷链物流质量水平，对需要低温保存的产品至关重要。"
                  />
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  <AnimatedNumber value={kpis.tempComplianceRate} decimals={2} />%
                </span>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">2-8°C范围</span>
            </div>
          </div>
        </div>

        {/* 趋势图表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">批次趋势</h3>
              <HelpTooltip
                mode="click"
                title="批次趋势"
                content="展示每日新增批次数量的变化趋势，便于洞察生产节奏与业务增长态势。"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends || []} key={`batches-${startDate}-${endDate}`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={trends && trends.length > 30 ? -45 : 0}
                  textAnchor={trends && trends.length > 30 ? 'end' : 'middle'}
                  height={trends && trends.length > 30 ? 60 : 30}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="batches" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="批次数量"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">事件趋势</h3>
              <HelpTooltip
                mode="click"
                title="事件趋势"
                content="展示每日流转事件数量的变化趋势，反映系统运营活跃度与业务流转情况。"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends || []} key={`events-${startDate}-${endDate}`}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={trends && trends.length > 30 ? -45 : 0}
                  textAnchor={trends && trends.length > 30 ? 'end' : 'middle'}
                  height={trends && trends.length > 30 ? 60 : 30}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  name="事件数量"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 统计概览 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">产品档案总数</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">批次总量</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.totalBatches}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">流转事件总数</p>
                <p className="text-2xl font-bold text-gray-900">{kpis.totalEvents}</p>
              </div>
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 分析模块导航 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/analytics/temperature" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">温控合规分析</h3>
            <p className="text-sm text-gray-600">温度监测数据统计与合规性深度分析</p>
          </Link>

          <Link to="/analytics/quality" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">质量分析</h3>
            <p className="text-sm text-gray-600">产品质量统计与不合格项深度分析</p>
          </Link>

          <Link to="/analytics/logistics" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">物流绩效分析</h3>
            <p className="text-sm text-gray-600">物流环节效率与绩效深度统计</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

