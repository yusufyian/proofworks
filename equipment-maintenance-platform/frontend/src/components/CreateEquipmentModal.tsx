import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import Modal from './Modal';
import HelpTooltip from './HelpTooltip';

interface CreateEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EQUIPMENT_CATEGORIES = ['数控机床', '注塑设备', '焊接设备', '空压设备', '叉车', '检测设备'];
const WORKSHOPS = ['生产车间A', '生产车间B', '装配车间', '机加工车间', '焊接车间', '涂装车间', '动力车间', '包装车间'];
const POSITIONS = ['1号工位', '2号工位', '3号工位', '4号工位', '5号工位', 'A区', 'B区', 'C区', 'D区'];
const DEPARTMENTS = ['生产部', '设备部', '质量部', '技术部', '安全部', '物流部'];
const SUPPLIERS = [
  '海天精密机械制造有限公司',
  '沈阳机床集团股份有限公司',
  '大连机床集团有限责任公司',
  '秦川机床工具集团股份有限公司',
  '山东威达重工股份有限公司',
  '江苏亚威机床股份有限公司',
];

export default function CreateEquipmentModal({ isOpen, onClose }: CreateEquipmentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    category: EQUIPMENT_CATEGORIES[0],
    supplier: SUPPLIERS[0],
    purchaseDate: '',
    purchasePrice: '',
    location: {
      workshop: WORKSHOPS[0],
      position: POSITIONS[0],
    },
    responsibility: {
      department: DEPARTMENTS[0],
      person: '',
    },
    technicalParams: {
      power: '',
      weight: '',
    },
  });
  const [error, setError] = useState('');

  const mutation = useMutation(
    async (data: any) => {
      const technicalParams: any = {};
      if (data.technicalParams.power && data.technicalParams.power !== '') {
        technicalParams.power = parseFloat(data.technicalParams.power);
      }
      if (data.technicalParams.weight && data.technicalParams.weight !== '') {
        technicalParams.weight = parseFloat(data.technicalParams.weight);
      }

      const res = await api.post('/equipment', {
        ...data,
        purchasePrice: parseFloat(data.purchasePrice),
        technicalParams: Object.keys(technicalParams).length > 0 ? technicalParams : undefined,
      });
      return res.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['equipment']);
        setFormData({
          name: '',
          model: '',
          serialNumber: '',
          category: EQUIPMENT_CATEGORIES[0],
          supplier: SUPPLIERS[0],
          purchaseDate: '',
          purchasePrice: '',
          location: {
            workshop: WORKSHOPS[0],
            position: POSITIONS[0],
          },
          responsibility: {
            department: DEPARTMENTS[0],
            person: '',
          },
          technicalParams: {
            power: '',
            weight: '',
          },
        });
        setError('');
        onClose();
      },
      onError: (err: any) => {
        setError(err.response?.data?.error || '创建设备失败，请重试');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证必填字段
    if (!formData.name || !formData.model || !formData.serialNumber || !formData.category 
        || !formData.supplier || !formData.purchaseDate || !formData.purchasePrice 
        || !formData.responsibility.person) {
      setError('请填写所有必填字段');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增设备" width="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">基本信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>设备名称 *</span>
                <HelpTooltip content="设备的完整名称，例如：数控车床-001" />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：数控车床-001"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>规格型号 *</span>
                <HelpTooltip content="设备的型号规格，例如：CNC-X500" />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="例如：CNC-X500"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>序列号 *</span>
                <HelpTooltip content="设备的厂家序列号，例如：SN123456" />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="例如：SN123456"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>设备类别 *</span>
                <HelpTooltip content="设备的分类，如数控机床、注塑设备等" />
              </label>
              <select
                required
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {EQUIPMENT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>供应商 *</span>
                <HelpTooltip content="设备的供应商名称" />
              </label>
              <select
                required
                className="input"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                {SUPPLIERS.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>采购日期 *</span>
                <HelpTooltip content="设备的采购日期" />
              </label>
              <input
                type="date"
                required
                className="input"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>原值（元） *</span>
                <HelpTooltip content="设备的采购价格，含税" />
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                className="input"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="例如：100000"
              />
            </div>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">位置信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>所属车间 *</span>
                <HelpTooltip content="设备所在的车间" />
              </label>
              <select
                required
                className="input"
                value={formData.location.workshop}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, workshop: e.target.value } 
                })}
              >
                {WORKSHOPS.map(ws => (
                  <option key={ws} value={ws}>{ws}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>安装位置 *</span>
                <HelpTooltip content="设备的具体安装位置" />
              </label>
              <select
                required
                className="input"
                value={formData.location.position}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  location: { ...formData.location, position: e.target.value } 
                })}
              >
                {POSITIONS.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 责任信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">责任信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>责任部门 *</span>
                <HelpTooltip content="负责该设备的部门" />
              </label>
              <select
                required
                className="input"
                value={formData.responsibility.department}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  responsibility: { ...formData.responsibility, department: e.target.value } 
                })}
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>责任人 *</span>
                <HelpTooltip content="设备的责任人姓名" />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.responsibility.person}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  responsibility: { ...formData.responsibility, person: e.target.value } 
                })}
                placeholder="请输入责任人姓名"
              />
            </div>
          </div>
        </div>

        {/* 技术参数 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">技术参数（可选）</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>功率（kW）</span>
                <HelpTooltip content="设备的功率，单位：千瓦" />
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input"
                value={formData.technicalParams.power}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technicalParams: { ...formData.technicalParams, power: e.target.value } 
                })}
                placeholder="例如：30"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>重量（kg）</span>
                <HelpTooltip content="设备的重量，单位：千克" />
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input"
                value={formData.technicalParams.weight}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  technicalParams: { ...formData.technicalParams, weight: e.target.value } 
                })}
                placeholder="例如：1000"
              />
            </div>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={mutation.isLoading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? '创建中...' : '创建设备'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
