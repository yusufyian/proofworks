import { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'react-query';
import { temperatureApi } from '../api/temperature';
import { batchesApi } from '../api/batches';
import { Thermometer, Snowflake, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import HelpTooltip from '../components/HelpTooltip';

export default function Temperature() {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  
  const { data: batchesData } = useQuery('batches', () => batchesApi.getBatches());
  const batches = batchesData?.data || [];

  // 不再需要时间范围作为查询参数，直接查询所有数据

  const { data, isLoading, error } = useQuery(
    ['temperature', selectedBatchId], // 只依赖批次ID，不依赖时间范围
    () => temperatureApi.getTemperatureData({
      batchId: selectedBatchId || undefined,
      // 不传时间范围，查询所有数据，前端自己过滤
    }),
    { 
      enabled: !!selectedBatchId,
      refetchOnWindowFocus: false,
      refetchOnMount: true, // 只在组件挂载时查询一次
      refetchOnReconnect: false,
      staleTime: Infinity, // 数据不变，永不重新查询
      cacheTime: 10 * 60 * 1000, // 缓存10分钟
    }
  );

  const temperatureData = data?.data || [];
  const selectedBatch = batches.find((b: any) => b.id === selectedBatchId);

  // 根据时间范围格式化时间轴
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (timeRange === '24h') {
      return format(date, 'HH:mm');
    } else if (timeRange === '7d') {
      return format(date, 'MM/dd HH:mm');
    } else {
      return format(date, 'MM/dd');
    }
  };

  // 使用useMemo优化数据处理，避免每次渲染都重新计算
  const { chartData, filteredData } = useMemo(() => {
    if (temperatureData.length === 0) {
      return { chartData: [], filteredData: [] };
    }

    // 如果没有数据在当前时间范围，显示所有查询到的数据
    const now = new Date();
    const getActualTimeRange = () => {
      switch (timeRange) {
        case '24h':
          return { start: subDays(now, 1), end: now };
        case '7d':
          return { start: subDays(now, 7), end: now };
        case '30d':
          return { start: subDays(now, 30), end: now };
      }
    };
    
    const actualRange = getActualTimeRange();
    const filtered = temperatureData.filter((item: any) => {
      const itemTime = new Date(item.timestamp);
      return itemTime >= actualRange.start && itemTime <= actualRange.end;
    });

    // 如果过滤后没有数据，使用所有查询到的数据（可能数据不在当前时间范围）
    const dataToShow = filtered.length > 0 ? filtered : temperatureData;

    // 限制数据点数量，避免图表渲染过慢（最多1000个点）
    const limitedData = dataToShow.slice(-1000);

    const chart = limitedData
      .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((item: any) => ({
        time: formatTime(item.timestamp),
        temperature: Number(item.temperature),
        humidity: item.humidity,
        timestamp: item.timestamp,
      }));

    return { chartData: chart, filteredData: filtered };
  }, [temperatureData, timeRange]);
  
  // 调试信息（使用useEffect避免无限循环）
  useEffect(() => {
    if (selectedBatchId) {
      console.log('Temperature query for batch:', selectedBatchId);
      console.log('Temperature data received:', temperatureData.length);
      console.log('Filtered data (chartData):', chartData.length);
      if (chartData.length > 0) {
        console.log('First chart data point:', chartData[0]);
        console.log('Last chart data point:', chartData[chartData.length - 1]);
      }
    }
  }, [selectedBatchId, temperatureData.length]); // 只在批次或数据量变化时输出

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">温控监控</h1>
          <p className="text-gray-600 mt-1">实时监控药品温度数据</p>
        </div>
        <HelpTooltip
          mode="click"
          title="温控监控说明"
          content="温控监控展示药品批次的实时和历史温度数据。系统每5分钟采集一次温控数据，包括温度、湿度、位置等信息。图表中的红色虚线表示温控范围的上限和下限，超出范围的数据会被标记为异常。"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 card">
          <h3 className="text-lg font-semibold mb-4">选择批次</h3>
          <select
            className="input mb-4"
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
          >
            <option value="">请选择批次</option>
            {batches.map((batch: any) => (
              <option key={batch.id} value={batch.id}>
                {batch.batchNo} - {batch.productName}
              </option>
            ))}
          </select>

          {selectedBatch && (
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">产品名称</div>
                <div className="font-medium">{selectedBatch.productName}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">温控范围</div>
                <div className="font-medium text-primary-600">
                  {selectedBatch.temperatureRange.min}°C ~ {selectedBatch.temperatureRange.max}°C
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">当前状态</div>
                <div className="font-medium">{selectedBatch.status}</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold gradient-text">温度曲线</h2>
                <p className="text-sm text-gray-500">实时温度变化趋势</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimeRange('24h')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === '24h'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                24小时
              </button>
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === '7d'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                7天
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === '30d'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                30天
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-red-400">
              <Snowflake className="w-12 h-12 mb-2 opacity-50" />
              <p>加载数据失败</p>
              <p className="text-xs mt-2">{(error as any)?.message || '请检查网络连接'}</p>
            </div>
          ) : chartData.length > 0 ? (
            <div>
              <div className="mb-4 text-sm text-gray-600">
                共 {chartData.length} 个数据点 | 
                平均温度: {(chartData.reduce((sum: number, d: any) => sum + d.temperature, 0) / chartData.length).toFixed(1)}°C |
                温度范围: {Math.min(...chartData.map((d: any) => d.temperature)).toFixed(1)}°C ~ {Math.max(...chartData.map((d: any) => d.temperature)).toFixed(1)}°C
                {filteredData.length === 0 && temperatureData.length > 0 && (
                  <span className="ml-2 text-yellow-600">
                    (显示所有查询到的数据，当前时间范围内无数据)
                  </span>
                )}
                {filteredData.length > 0 && temperatureData.length > filteredData.length && (
                  <span className="ml-2 text-gray-400">
                    (共查询到 {temperatureData.length} 条，已过滤到当前时间范围)
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart 
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  fontSize={12}
                  interval={Math.max(0, Math.floor(chartData.length / 12))}
                  angle={timeRange === '24h' ? 0 : -45}
                  textAnchor={timeRange === '24h' ? 'middle' : 'end'}
                  height={timeRange === '24h' ? 30 : 60}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip />
                <Legend />
                {selectedBatch && (
                  <>
                    <ReferenceLine 
                      y={selectedBatch.temperatureRange.max} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label="上限"
                    />
                    <ReferenceLine 
                      y={selectedBatch.temperatureRange.min} 
                      stroke="#ef4444" 
                      strokeDasharray="5 5"
                      label="下限"
                    />
                  </>
                )}
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={chartData.length < 50}
                  dotRadius={chartData.length < 50 ? 3 : 0}
                  activeDot={{ r: 5 }}
                  name="温度 (°C)"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          ) : selectedBatchId ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Snowflake className="w-12 h-12 mb-2 opacity-50" />
              <p>该批次在当前时间范围内暂无温控数据</p>
              <p className="text-xs mt-2">请尝试切换时间范围或选择其他批次</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Snowflake className="w-12 h-12 mb-2 opacity-50" />
              <p>请选择批次查看温控数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

