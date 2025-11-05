import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { traceApi, TraceResult } from '../api/trace';
import HelpTooltip from '../components/HelpTooltip';
import { Search, MapPin, Thermometer, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';

export const Trace: React.FC = () => {
  const { batchId } = useParams<{ batchId?: string }>();
  const [traceCode, setTraceCode] = useState('');
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleCodes, setSampleCodes] = useState<string[]>([]);

  useEffect(() => {
    if (batchId) {
      loadByBatchId(batchId);
    } else {
      // 加载示例追溯码
      loadSampleCodes();
    }
  }, [batchId]);

  const loadSampleCodes = async () => {
    try {
      const response = await traceApi.getSampleCodes();
      setSampleCodes(response.data.sampleCodes || []);
    } catch (error) {
      console.error('Failed to load sample codes:', error);
    }
  };

  const loadByBatchId = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await traceApi.traceByBatch(id);
      setResult(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || '查询失败');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!traceCode.trim()) {
      setError('请输入追溯码');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await traceApi.traceByCode(traceCode.trim());
      setResult(response.data || null);
    } catch (err: any) {
      setError(err.response?.data?.error || '查询失败，请检查追溯码是否正确');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('检测')) return '🔬';
    if (eventType.includes('运输') || eventType.includes('装车')) return '🚚';
    if (eventType.includes('入库') || eventType.includes('出库')) return '📦';
    if (eventType.includes('加工') || eventType.includes('包装')) return '⚙️';
    if (eventType.includes('收获') || eventType.includes('播种') || eventType.includes('施肥')) return '🌱';
    if (eventType.includes('到货')) return '✅';
    if (eventType.includes('上架')) return '🏪';
    return '📍';
  };

  const getEventStage = (eventType: string, index: number) => {
    if (index < 3) return '种植阶段';
    if (index < 6) return '加工阶段';
    if (index < 9) return '质检阶段';
    if (index < 11) return '仓储阶段';
    if (index < 16) return '物流阶段';
    return '销售阶段';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">追溯查询</h1>
            <p className="text-gray-600 mt-1">通过追溯码查询产品完整溯源信息</p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={batchId ? "正在加载批次信息..." : "请输入20位追溯码"}
                value={traceCode}
                onChange={(e) => setTraceCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !batchId && handleSearch()}
                disabled={!!batchId}
                className="input pl-12 font-mono text-lg disabled:bg-gray-100"
              />
            </div>
            {!batchId && (
              <>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="btn-primary px-8 py-3 disabled:opacity-50"
                >
                  {loading ? '查询中...' : '查询'}
                </button>
                <HelpTooltip 
                  mode="hover"
                  title="追溯码说明"
                  content="追溯码格式：企业代码6位 + 产品类别2位 + 生产日期6位 + 批次2位 + 序列号3位 + 校验位1位，共20位。可以通过扫描产品包装上的二维码获取追溯码。" 
                />
              </>
            )}
          </div>
          
          {/* 示例追溯码 */}
          {!batchId && sampleCodes.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">示例追溯码（点击快速查询）：</p>
              <div className="flex flex-wrap gap-2">
                {sampleCodes.slice(0, 5).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setTraceCode(code);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-mono text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* 查询结果 */}
        {result && (
          <div className="space-y-6">
            {/* 产品基本信息 */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">产品信息</h2>
                <HelpTooltip content="显示产品的基本信息，包括产品名称、品牌、规格、生产企业、产地等。" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">产品名称</p>
                  <p className="text-lg font-semibold text-gray-900">{result.product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">品牌</p>
                  <p className="text-lg font-semibold text-gray-900">{result.product.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">规格</p>
                  <p className="text-lg font-semibold text-gray-900">{result.product.specification}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">类别</p>
                  <p className="text-lg font-semibold text-gray-900">{result.product.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">生产企业</p>
                  <p className="text-lg font-semibold text-gray-900">{result.product.manufacturer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">产地</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {result.product.origin.province} {result.product.origin.city} {result.product.origin.district}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                  {result.product.origin.certifications.map((cert) => (
                    <span key={cert} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      ✓ {cert}
                    </span>
                  ))}
              </div>
            </div>

            {/* 批次信息 */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">批次信息</h2>
                <HelpTooltip content="显示批次的基本信息，包括批次号、生产日期、保质期、数量、质检报告等。" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">批次号</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">{result.batch.batchNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">生产日期</p>
                  <p className="text-lg font-semibold text-gray-900">{result.batch.productionDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">保质期</p>
                  <p className="text-lg font-semibold text-gray-900">{result.batch.expiryDays} 天</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">数量</p>
                  <p className="text-lg font-semibold text-gray-900">{result.batch.quantity} {result.batch.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">状态</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.batch.status === '合格' ? 'bg-green-100 text-green-800' :
                    result.batch.status === '生产中' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.batch.status}
                  </span>
                </div>
              </div>

              {/* 质检报告 */}
              {result.batch.qualityReports.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">质检报告</h3>
                  <div className="space-y-2">
                    {result.batch.qualityReports.map((report, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{report.testItem}</p>
                            <p className="text-sm text-gray-600">检测机构: {report.agency}</p>
                            <p className="text-sm text-gray-600">报告编号: {report.reportNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{report.result}</p>
                            <p className="text-xs text-gray-500">{report.testDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 流转时间轴 */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">流转时间轴</h2>
                  <p className="text-sm text-gray-500 mt-1">共 {result.events.length} 个流转节点</p>
                </div>
                <HelpTooltip 
                  mode="hover"
                  title="流转时间轴"
                  content="显示产品从种植到销售的完整流转路径，包括各个关键环节的时间、地点、操作人员等信息。每个节点都记录了详细的流转信息，确保全程可追溯。" 
                />
              </div>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500"></div>
                <div className="space-y-4">
                  {result.events.map((event, idx) => {
                    const stage = getEventStage(event.eventType, idx);
                    const stageColors: Record<string, string> = {
                      '种植阶段': 'from-green-500 to-green-600',
                      '加工阶段': 'from-blue-500 to-blue-600',
                      '质检阶段': 'from-purple-500 to-purple-600',
                      '仓储阶段': 'from-yellow-500 to-yellow-600',
                      '物流阶段': 'from-orange-500 to-orange-600',
                      '销售阶段': 'from-pink-500 to-pink-600',
                    };
                    const stageColor = stageColors[stage] || 'from-gray-500 to-gray-600';
                    
                    return (
                      <div key={event.id} className="relative pl-12">
                        <div className={`absolute left-0 top-1 w-8 h-8 bg-gradient-to-br ${stageColor} rounded-full flex items-center justify-center text-white text-lg shadow-lg border-2 border-white`}>
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">{event.eventType}</h4>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                  stage === '种植阶段' ? 'bg-green-100 text-green-800' :
                                  stage === '加工阶段' ? 'bg-blue-100 text-blue-800' :
                                  stage === '质检阶段' ? 'bg-purple-100 text-purple-800' :
                                  stage === '仓储阶段' ? 'bg-yellow-100 text-yellow-800' :
                                  stage === '物流阶段' ? 'bg-orange-100 text-orange-800' :
                                  'bg-pink-100 text-pink-800'
                                }`}>
                                  {stage}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                <MapPin className="w-4 h-4 inline mr-1" />
                                {event.location.name}
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-600 ml-4">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm')}
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600 space-y-1">
                            <p>操作人员: <span className="font-medium">{event.operator.name}</span> ({event.operator.role})</p>
                            <p>所属企业: <span className="font-medium">{event.operator.company}</span></p>
                            {event.content.quantity && (
                              <p>数量: <span className="font-medium">{event.content.quantity}</span></p>
                            )}
                            {event.content.temperature !== undefined && (
                              <p className="flex items-center gap-1">
                                <Thermometer className="w-4 h-4" />
                                温度: <span className="font-medium">{event.content.temperature}°C</span>
                              </p>
                            )}
                            {event.content.humidity !== undefined && (
                              <p>湿度: <span className="font-medium">{event.content.humidity}%</span></p>
                            )}
                          </div>
                          {event.txHash && (
                            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 font-mono">
                              区块高度: {event.blockHeight} | 交易哈希: {event.txHash.slice(0, 20)}...
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* IoT数据 */}
            {result.iotData.length > 0 && (
              <div className="card">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">IoT传感器数据</h2>
                  <HelpTooltip content="显示来自各种传感器设备的实时数据，包括温度、湿度、GPS定位等信息，确保产品在流转过程中的环境条件符合要求。" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.iotData.slice(0, 12).map((data) => (
                    <div key={data.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {data.sensorType === 'temperature' ? '🌡️ 温度' :
                           data.sensorType === 'humidity' ? '💧 湿度' :
                           data.sensorType === 'gps' ? '📍 GPS' : data.sensorType}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(data.timestamp), 'MM-dd HH:mm')}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {Array.isArray(data.value) 
                          ? `${data.value[0].toFixed(4)}, ${data.value[1].toFixed(4)}`
                          : `${data.value}${data.sensorType === 'temperature' ? '°C' : data.sensorType === 'humidity' ? '%' : ''}`
                        }
                      </p>
                      {data.location && (
                        <p className="text-xs text-gray-600 mt-1">{data.location.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 召回信息 */}
            {result.recall && (
              <div className="card border-2 border-orange-300 bg-orange-50">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-orange-900">⚠️ 召回信息</h2>
                  <HelpTooltip content="如果产品涉及召回，会在此显示召回原因、风险等级、召回进度等信息。" />
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">召回原因</p>
                    <p className="text-lg font-semibold text-gray-900">{result.recall.reason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">风险等级</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.recall.riskLevel === '紧急' ? 'bg-red-100 text-red-800' :
                      result.recall.riskLevel === '高' ? 'bg-orange-100 text-orange-800' :
                      result.recall.riskLevel === '中' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {result.recall.riskLevel}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">召回进度</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {result.recall.recallProgress.recalledQuantity} / {result.recall.recallProgress.totalQuantity}
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(result.recall.recallProgress.recalledQuantity / result.recall.recallProgress.totalQuantity) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

