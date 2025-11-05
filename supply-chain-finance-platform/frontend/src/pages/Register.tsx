import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { Building2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    companyName: '',
    unifiedSocialCreditCode: '',
    companyType: 'supplier' as 'core_enterprise' | 'supplier' | 'bank',
    role: 'supplier' as 'core_enterprise' | 'supplier' | 'bank',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.register(formData);
      setAuth(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">注册新账号</h1>
            <p className="text-gray-600 text-lg">创建您的供应链金融平台账户</p>
          </div>

          {/* 注册表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="label">
                  邮箱地址 *
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="example@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  密码 *
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="name" className="label">
                  姓名 *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  className="input"
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  手机号
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  placeholder="138xxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="companyName" className="label">
                  公司名称 *
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  className="input"
                  placeholder="请输入公司全称"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="unifiedSocialCreditCode" className="label">
                  统一社会信用代码 *
                </label>
                <input
                  id="unifiedSocialCreditCode"
                  type="text"
                  required
                  className="input"
                  placeholder="91110000MAXXXXXXXX"
                  value={formData.unifiedSocialCreditCode}
                  onChange={(e) => setFormData({ ...formData, unifiedSocialCreditCode: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="companyType" className="label">
                  公司类型 *
                </label>
                <select
                  id="companyType"
                  required
                  className="input"
                  value={formData.companyType}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    setFormData({ ...formData, companyType: type, role: type });
                  }}
                >
                  <option value="supplier">供应商</option>
                  <option value="core_enterprise">核心企业</option>
                  <option value="bank">银行</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>注册中...</span>
                </span>
              ) : (
                '注册'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              已有账号？{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                立即登录
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
