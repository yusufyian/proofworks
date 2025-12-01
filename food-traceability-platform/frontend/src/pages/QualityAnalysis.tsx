import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { analyticsApi, QualityAnalysis as QualityAnalysisData } from '../api/analytics';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { format } from 'date-fns';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { CheckCircle, AlertCircle, FileText } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import HelpTooltip from '../components/HelpTooltip';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const QualityAnalysis: React.FC = () => {
  // 默认显示从2024年6月1日开始的所有数据
  const [startDate, setStartDate] = useState('2024-06-01');
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [data, setData] = useState<QualityAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response: any = await analyticsApi.getQualityAnalysis({ startDate, endDate });
      if (response && response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('加载质量数据失败:', error);
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

  const statusData = Object.keys(data.statusStats).map(key => ({
    name: key,
    value: data.statusStats[key],
  }));

  const categoryData = Object.keys(data.categoryStats).map(key => ({
    name: key,
    value: data.categoryStats[key],
  }));

  const qualityIssuesData = Object.keys(data.qualityIssues).map(key => ({
    name: key,
    value: data.qualityIssues[key],
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const testResultsData = Object.keys(data.testResults).map(key => ({
    name: key,
    value: data.testResults[key],
  }));

  const qualifiedRate = data.totalBatches > 0 
    ? (data.qualifiedBatches / data.totalBatches) * 100 
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题和筛选 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">质量分析</h1>
            <p className="text-gray-600 mt-1">产品质量统计与不合格项深度分析</p>
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
                  <p className="text-sm text-gray-600">合格率</p>
                  <HelpTooltip
                    mode="click"
                    title="合格率"
                    content="通过质量检测并符合标准的批次占总批次的百分比。合格率反映产品质量控制水平，是衡量企业质量管理能力的重要指标。"
                  />
                </div>
                <AnimatedNumber 
                  value={qualifiedRate} 
                  suffix="%" 
                  className="text-2xl font-bold text-green-600"
                />
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {data.qualifiedBatches} / {data.totalBatches} 批次
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">批次总量</p>
                  <HelpTooltip
                    mode="click"
                    title="批次总量"
                    content="统计时间范围内所有产品批次的总量，包括各种状态的批次。"
                  />
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.totalBatches}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              统计时间范围内批次
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">不合格项</p>
                  <HelpTooltip
                    mode="click"
                    title="不合格项"
                    content="检测中发现的不合格问题类型数量。不合格项越多，表明质量问题越复杂，需要重点关注与改进。"
                  />
                </div>
                <p className="text-2xl font-bold text-orange-600">{Object.keys(data.qualityIssues).length}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              需重点关注的问题类型
            </div>
          </div>
        </div>

        {/* 批次状态分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">批次状态分布</h3>
              <HelpTooltip
                mode="click"
                title="批次状态"
                content="统计不同状态的批次数量，包括合格、生产中、不合格、已召回等状态维度。"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">产品类别分布</h3>
              <HelpTooltip
                mode="click"
                title="产品类别"
                content="按产品类别统计批次数量，了解各类产品的生产情况。"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 质检结果统计 */}
        {testResultsData.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">检测结果统计</h3>
              <HelpTooltip
                mode="click"
                title="检测结果"
                content="统计各类检测结果的数量分布，包括合格、未检出、符合标准等。"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testResultsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 质量不合格项Top10 */}
        {qualityIssuesData.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">质量不合格项 Top 10</h3>
              <HelpTooltip
                mode="click"
                title="不合格项"
                content="统计出现频率最高的不合格检测项目，帮助识别质量问题重点。"
              />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={qualityIssuesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Layout>
  );
};

