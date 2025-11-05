import React, { useState } from 'react';
import { Package, X } from 'lucide-react';
import Modal from './Modal';
import HelpTooltip from './HelpTooltip';
import { productApi, Product } from '../api/products';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const categories = ['水果', '蔬菜', '肉类', '水产', '乳制品', '粮油', '其他'];

export default function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '水果',
    specification: '',
    manufacturer: {
      name: '',
      creditCode: '',
      license: '',
      address: '',
    },
    origin: {
      province: '',
      city: '',
      district: '',
      gps: [0, 0] as [number, number],
      certifications: [] as string[],
    },
  });
  const [certificationInput, setCertificationInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 验证必填字段
      if (!formData.name || !formData.brand || !formData.manufacturer.name || 
          !formData.manufacturer.creditCode || !formData.origin.province || 
          !formData.origin.city) {
        setError('请填写所有必填字段');
        setLoading(false);
        return;
      }

      await productApi.createProduct(formData);
      
      // 重置表单
      setFormData({
        name: '',
        brand: '',
        category: '水果',
        specification: '',
        manufacturer: {
          name: '',
          creditCode: '',
          license: '',
          address: '',
        },
        origin: {
          province: '',
          city: '',
          district: '',
          gps: [0, 0],
          certifications: [],
        },
      });
      setCertificationInput('');
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || '创建产品失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const addCertification = () => {
    if (certificationInput.trim() && !formData.origin.certifications.includes(certificationInput.trim())) {
      setFormData({
        ...formData,
        origin: {
          ...formData.origin,
          certifications: [...formData.origin.certifications, certificationInput.trim()],
        },
      });
      setCertificationInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData({
      ...formData,
      origin: {
        ...formData.origin,
        certifications: formData.origin.certifications.filter(c => c !== cert),
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="新增产品"
      icon={<Package className="w-6 h-6 text-white" />}
      headerColor="primary"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center space-x-2">
            <X className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">基本信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>产品名称 *</span>
                <HelpTooltip
                  mode="hover"
                  title="产品名称"
                  content="请输入产品的完整名称，例如：有机草莓、绿色蔬菜等。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：有机草莓"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>品牌 *</span>
                <HelpTooltip
                  mode="hover"
                  title="品牌"
                  content="产品的品牌名称。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="例如：绿源"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>产品类别 *</span>
                <HelpTooltip
                  mode="hover"
                  title="产品类别"
                  content="选择产品所属的类别，用于分类管理。"
                />
              </label>
              <select
                required
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>规格</span>
                <HelpTooltip
                  mode="hover"
                  title="规格"
                  content="产品的规格，例如：500g/盒、1kg/袋等。"
                />
              </label>
              <input
                type="text"
                className="input"
                value={formData.specification}
                onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
                placeholder="例如：500g/盒"
              />
            </div>
          </div>
        </div>

        {/* 生产企业信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">生产企业信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>企业名称 *</span>
                <HelpTooltip
                  mode="hover"
                  title="企业名称"
                  content="生产该产品的企业全称。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.manufacturer.name}
                onChange={(e) => setFormData({
                  ...formData,
                  manufacturer: { ...formData.manufacturer, name: e.target.value }
                })}
                placeholder="例如：绿源生态农业有限公司"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>统一社会信用代码 *</span>
                <HelpTooltip
                  mode="hover"
                  title="统一社会信用代码"
                  content="企业的18位统一社会信用代码。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.manufacturer.creditCode}
                onChange={(e) => setFormData({
                  ...formData,
                  manufacturer: { ...formData.manufacturer, creditCode: e.target.value }
                })}
                placeholder="18位统一社会信用代码"
                maxLength={18}
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>生产许可证</span>
                <HelpTooltip
                  mode="hover"
                  title="生产许可证"
                  content="食品生产许可证编号。"
                />
              </label>
              <input
                type="text"
                className="input"
                value={formData.manufacturer.license}
                onChange={(e) => setFormData({
                  ...formData,
                  manufacturer: { ...formData.manufacturer, license: e.target.value }
                })}
                placeholder="例如：SC12345678901234"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>企业地址</span>
                <HelpTooltip
                  mode="hover"
                  title="企业地址"
                  content="生产企业的详细地址。"
                />
              </label>
              <input
                type="text"
                className="input"
                value={formData.manufacturer.address}
                onChange={(e) => setFormData({
                  ...formData,
                  manufacturer: { ...formData.manufacturer, address: e.target.value }
                })}
                placeholder="例如：山东省烟台市XX区XX路XX号"
              />
            </div>
          </div>
        </div>

        {/* 产地信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">产地信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label flex items-center space-x-2">
                <span>省份 *</span>
                <HelpTooltip
                  mode="hover"
                  title="省份"
                  content="产品产地的省份。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.origin.province}
                onChange={(e) => setFormData({
                  ...formData,
                  origin: { ...formData.origin, province: e.target.value }
                })}
                placeholder="例如：山东"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>城市 *</span>
                <HelpTooltip
                  mode="hover"
                  title="城市"
                  content="产品产地的城市。"
                />
              </label>
              <input
                type="text"
                required
                className="input"
                value={formData.origin.city}
                onChange={(e) => setFormData({
                  ...formData,
                  origin: { ...formData.origin, city: e.target.value }
                })}
                placeholder="例如：烟台"
              />
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <span>区县</span>
                <HelpTooltip
                  mode="hover"
                  title="区县"
                  content="产品产地的区县。"
                />
              </label>
              <input
                type="text"
                className="input"
                value={formData.origin.district}
                onChange={(e) => setFormData({
                  ...formData,
                  origin: { ...formData.origin, district: e.target.value }
                })}
                placeholder="例如：栖霞市"
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center space-x-2">
              <span>认证信息</span>
              <HelpTooltip
                mode="hover"
                title="认证信息"
                content="添加产品的认证信息，例如：有机认证、绿色食品、无公害认证等。可以添加多个认证。"
              />
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="input flex-1"
                value={certificationInput}
                onChange={(e) => setCertificationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                placeholder="输入认证名称后按回车添加"
              />
              <button
                type="button"
                onClick={addCertification}
                className="btn-secondary px-4 py-3 whitespace-nowrap"
              >
                添加
              </button>
            </div>
            {formData.origin.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.origin.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '创建中...' : '创建产品'}
          </button>
        </div>
      </form>
    </Modal>
  );
}





