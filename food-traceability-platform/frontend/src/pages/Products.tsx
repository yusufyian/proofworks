import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { productApi, Product } from '../api/products';
import HelpTooltip from '../components/HelpTooltip';
import CreateProductModal from '../components/CreateProductModal';
import { Search, Filter, Plus } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      
      const result: any = await productApi.getProducts(params);
      if (result && result.success && result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProducts();
  };

  const categories = ['水果', '蔬菜', '肉类', '水产', '乳制品', '粮油', '其他'];

  return (
    <Layout>
      <div className="space-y-6">
        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">产品档案</h1>
            <p className="text-gray-600 mt-1">产品档案与基础信息统一管理</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>新增产品档案</span>
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="glass rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="请输入产品名称或品牌进行检索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部类别</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              检索
            </button>
          </div>
        </div>

        {/* 产品列表 */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="glass rounded-xl p-6 card-hover group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {product.category}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span>产品规格:</span>
                    <span className="font-medium">{product.specification}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>生产企业:</span>
                    <span className="font-medium truncate ml-2">{product.manufacturer.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>产品产地:</span>
                    <span className="font-medium">{product.origin.province} {product.origin.city}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {product.origin.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                    >
                      {cert}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>创建时间: {new Date(product.createdAt).toLocaleDateString()}</span>
                    <HelpTooltip 
                      mode="click"
                      title="产品详细信息"
                      content={
                        <div>
                          <p className="font-semibold mb-2">产品详细信息</p>
                          <p><strong>生产许可证:</strong> {product.manufacturer.license}</p>
                          <p><strong>企业地址:</strong> {product.manufacturer.address}</p>
                          <p><strong>详细产地:</strong> {product.origin.district}</p>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            未找到匹配的产品记录
          </div>
        )}

        {/* 创建产品模态框 */}
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadProducts();
            setShowCreateModal(false);
          }}
        />
      </div>
    </Layout>
  );
};

