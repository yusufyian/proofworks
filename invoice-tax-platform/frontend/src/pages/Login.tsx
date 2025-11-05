import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { FileText, Shield, Zap, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      setAuth(response.data.data.user, response.data.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-8 relative z-10">
        <div className="hidden md:flex flex-col justify-center text-white p-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-6 border border-white/30">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4">发票税务协同平台</h1>
            <p className="text-xl text-indigo-100 mb-8">防伪验证 · 智能匹配 · 税务合规</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">防伪验证</h3>
                <p className="text-indigo-100">发票真伪秒级验证，假发票拦截率99.9%</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">智能匹配</h3>
                <p className="text-indigo-100">三单自动匹配，报销审批从数天缩短至数小时</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">税务合规</h3>
                <p className="text-indigo-100">自动三单匹配，降低税务稽查风险</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">欢迎登录</h2>
              <p className="text-gray-600">发票单据防伪与税务协同平台</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">邮箱地址</label>
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
                <label htmlFor="password" className="label">密码</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>登录中...</span>
                  </span>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                还没有账号？{' '}
                <a href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                  立即注册
                </a>
              </p>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700 font-medium mb-2">测试账号：</p>
              <p className="text-xs text-blue-600">admin@example.com / 密码：admin123</p>
              <p className="text-xs text-blue-600 mt-1">user1@example.com / 密码：123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

