import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { equipmentApi } from '../api/equipment';
import { ArrowLeft, Package, Cpu, Link } from 'lucide-react';
import { format } from 'date-fns';
import HelpTooltip from '../components/HelpTooltip';

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['equipment', id],
    () => equipmentApi.getById(id!),
    { enabled: !!id }
  );

  const equipment = data?.data;

  if (isLoading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!equipment) {
    return <div className="text-center py-12">设备不存在</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/equipment')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>返回设备列表</span>
      </button>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{equipment.name}</h1>
            <p className="text-gray-600">设备编号：{equipment.equipmentNumber}</p>
          </div>
          {equipment.blockchainTxHash && (
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <Link className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">已上链存证</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">基本信息</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">设备类型</dt>
                <dd className="font-medium">{equipment.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">规格型号</dt>
                <dd className="font-medium">{equipment.specification}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">序列号</dt>
                <dd className="font-medium">{equipment.serialNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">制造商</dt>
                <dd className="font-medium">{equipment.manufacturer}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">位置信息</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">所属车间</dt>
                <dd className="font-medium">{equipment.workshop}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">安装位置</dt>
                <dd className="font-medium">{equipment.location}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">责任部门</dt>
                <dd className="font-medium">{equipment.responsibleDepartment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">责任人</dt>
                <dd className="font-medium">{equipment.responsiblePerson}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">采购信息</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">供应商</dt>
                <dd className="font-medium">{equipment.supplier}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">采购日期</dt>
                <dd className="font-medium">{format(new Date(equipment.purchaseDate), 'yyyy-MM-dd')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">采购价格</dt>
                <dd className="font-medium">¥{(equipment.purchasePrice / 10000).toFixed(1)}万</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">技术参数</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600">功率</dt>
                <dd className="font-medium">{equipment.power}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">重量</dt>
                <dd className="font-medium">{equipment.weight}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">健康度</dt>
                <dd className={`font-medium ${equipment.healthScore >= 80 ? 'text-green-600' : equipment.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {equipment.healthScore}%
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

