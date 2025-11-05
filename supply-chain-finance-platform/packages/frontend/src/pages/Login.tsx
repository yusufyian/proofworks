import { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      await authService.register(values);
      message.success('注册成功，请登录');
      setIsLogin(true);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
            供应链金融平台
          </h1>
          <p style={{ color: '#8c8c8c' }}>
            Supply Chain Finance Platform
          </p>
        </div>

        <Form
          form={form}
          onFinish={isLogin ? handleLogin : handleRegister}
          layout="vertical"
          size="large"
        >
          {!isLogin && (
            <>
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input placeholder="邮箱" />
              </Form.Item>
              <Form.Item
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="选择角色">
                  <Select.Option value="core_enterprise">核心企业</Select.Option>
                  <Select.Option value="supplier">供应商</Select.Option>
                  <Select.Option value="bank">银行</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="companyName"
              >
                <Input placeholder="公司名称（可选）" />
              </Form.Item>
            </>
          )}

          {isLogin && (
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名或邮箱' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名或邮箱" />
            </Form.Item>
          )}

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: 44 }}
            >
              {isLogin ? '登录' : '注册'}
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a
              onClick={() => {
                setIsLogin(!isLogin);
                form.resetFields();
              }}
              style={{ cursor: 'pointer' }}
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
}

