import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { analyticsApi, TemperatureAnalysis as TemperatureAnalysisData } from '../api/analytics';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { format } from 'date-fns';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Thermometer, AlertCircle, CheckCircle } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import HelpTooltip from '../components/HelpTooltip';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const TemperatureAnalysis: React.FC = () => {
  // 默认显示从2024年6月1日开始的所有数据
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<TemperatureAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response: any = await analyticsApi.getTemperatureAnalysis({ startDate, endDate });
      if (response && response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('加载温控数据失败:', error);
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

  const tempRangeData = Object.keys(data.tempRanges).map(key => ({
    name: key,
    value: data.tempRanges[key],
  }));

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题和筛选 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">温控合规分析</h1>
            <p className="text-gray-600 mt-1">温度监测数据统计与合规性深度分析</p>
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
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">温控合规率</p>
                  <HelpTooltip
                    mode="click"
                    title="温控合规率"
                    content="温度控制在2-8°C范围内的监测数据点占总数据点的百分比。合规率越高，表明冷链物流质量水平越好。"
                  />
                </div>
                <AnimatedNumber 
                  value={data.complianceRate} 
                  suffix="%" 
                  className="text-2xl font-bold text-green-600"
                />
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              2-8°C合规范围
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">异常事件</p>
                  <HelpTooltip
                    mode="click"
                    title="异常事件"
                    content="温度超出规定范围或出现异常波动的事件数量。异常事件需及时处理，确保产品质量安全。"
                  />
                </div>
                <p className="text-2xl font-bold text-orange-600">{data.abnormalEvents}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              需重点关注的事件
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">数据点总数</p>
                  <HelpTooltip
                    mode="click"
                    title="数据点总数"
                    content="统计期间内所有温度监测数据点的总量。数据点越多，表明监测覆盖越全面，数据越可靠。"
                  />
                </div>
                <p className="text-2xl font-bold text-blue-600">{data.totalDataPoints.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Thermometer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              温度监测记录
            </div>
          </div>
        </div>

        {/* 温度分布饼图 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">温度分布统计</h3>
            <HelpTooltip
              mode="click"
              title="温度分布"
              content="统计不同温度范围内的数据点数量，便于识别温控异常情况。"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tempRangeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {tempRangeData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 温度趋势图 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">温度趋势曲线</h3>
            <HelpTooltip
              mode="click"
              title="温度趋势"
              content="显示每日平均温度、最低温度和最高温度的变化趋势，帮助识别温控模式。"
            />
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.tempTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avg" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                name="平均温度"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="min" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="最低温度"
                strokeDasharray="5 5"
              />
              <Line 
                type="monotone" 
                dataKey="max" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="最高温度"
                strokeDasharray="5 5"
              />
              {/* 参考线 */}
              <Line 
                type="monotone" 
                dataKey={() => 8} 
                stroke="#f59e0b" 
                strokeWidth={1} 
                strokeDasharray="3 3"
                name="上限(8°C)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey={() => 2} 
                stroke="#f59e0b" 
                strokeWidth={1} 
                strokeDasharray="3 3"
                name="下限(2°C)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 温度分布柱状图 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">温度范围分布</h3>
            <HelpTooltip
              mode="click"
              title="温度范围分布"
              content="按温度范围统计数据点数量，直观展示温控合规情况。"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tempRangeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

