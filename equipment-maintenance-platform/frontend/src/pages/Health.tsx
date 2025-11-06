import { useQuery } from 'react-query';
import api from '../services/api';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { format } from 'date-fns';

export default function Health() {
  const { data, isLoading } = useQuery(
    'health-assessments',
    async () => {
      const res = await api.get('/health');
      return res.data;
    }
  );

  const getHealthBadge = (score: number) => {
    if (score >= 90) return { color: 'text-green-600 bg-green-100', text: '优秀' };
    if (score >= 70) return { color: 'text-blue-600 bg-blue-100', text: '良好' };
    if (score >= 50) return { color: 'text-yellow-600 bg-yellow-100', text: '一般' };
    return { color: 'text-red-600 bg-red-100', text: '差' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">设备健康监测</h1>
          <p className="text-gray-600">设备健康度评估与预测性维护</p>
        </div>
        <div className="flex items-center space-x-3">
          <HelpTooltip
            content="设备健康监测系统通过IoT传感器实时采集设备的振动、温度、电流、噪音等数据，通过AI算法综合评估设备健康度。系统会根据健康度分数自动预警，提醒维修人员提前检修，实现从被动维修向主动预防的转变。"
            title="设备健康监测"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {(data?.assessments || []).slice(0, 10).map((assessment: any) => {
            const badge = getHealthBadge(assessment.healthScore);
            return (
              <div key={assessment.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {assessment.equipmentNo}
                    </h3>
                    <p className="text-sm text-gray-500">
                      评估时间: {format(new Date(assessment.assessmentDate), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`px-4 py-2 rounded-lg ${badge.color} font-semibold mb-2`}>
                      {badge.text}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {assessment.healthScore} 分
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                  {assessment.indicators.vibration && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">振动</p>
                      <p className={`text-sm font-semibold ${
                        assessment.indicators.vibration.normal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assessment.indicators.vibration.value.toFixed(2)} mm/s
                      </p>
                    </div>
                  )}
                  {assessment.indicators.temperature && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">温度</p>
                      <p className={`text-sm font-semibold ${
                        assessment.indicators.temperature.normal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assessment.indicators.temperature.value.toFixed(1)}°C
                      </p>
                    </div>
                  )}
                  {assessment.indicators.current && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">电流</p>
                      <p className={`text-sm font-semibold ${
                        assessment.indicators.current.normal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assessment.indicators.current.value.toFixed(1)} A
                      </p>
                    </div>
                  )}
                  {assessment.indicators.noise && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">噪音</p>
                      <p className={`text-sm font-semibold ${
                        assessment.indicators.noise.normal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {assessment.indicators.noise.value.toFixed(1)} dB
                      </p>
                    </div>
                  )}
                  {assessment.indicators.performance && (
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">精度</p>
                      <p className={`text-sm font-semibold ${
                        assessment.indicators.performance.normal ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ±{assessment.indicators.performance.value.toFixed(3)} mm
                      </p>
                    </div>
                  )}
                </div>

                {assessment.recommendation && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-yellow-800">{assessment.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
