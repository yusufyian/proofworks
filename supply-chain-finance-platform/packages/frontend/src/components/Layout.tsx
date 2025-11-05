import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  SwapOutlined,
  DollarOutlined,
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

const { Header, Sider, Content } = AntLayout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/certificates',
    icon: <FileTextOutlined />,
    label: '凭证管理',
  },
  {
    key: '/transfers',
    icon: <SwapOutlined />,
    label: '凭证流转',
  },
  {
    key: '/financing',
    icon: <DollarOutlined />,
    label: '融资服务',
  },
  {
    key: '/audit',
    icon: <AuditOutlined />,
    label: '审计查询',
  },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      core_enterprise: '核心企业',
      supplier: '供应商',
      bank: '银行',
      admin: '管理员',
    };
    return roleMap[role] || role;
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
        }}
      >
        <div
          style={{
            height: 64,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
            供应链金融平台
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>
      <AntLayout style={{ marginLeft: 250 }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            {menuItems.find((item) => item.key === location.pathname)?.label || '供应链金融平台'}
          </div>
          <Space>
            {user?.role === 'core_enterprise' && (
              <AntLayout.Header
                style={{
                  padding: 0,
                  background: 'transparent',
                  marginRight: 16,
                }}
              >
                <button
                  onClick={() => navigate('/certificates/issue')}
                  style={{
                    background: '#1890ff',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <PlusOutlined />
                  签发凭证
                </button>
              </AntLayout.Header>
            )}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.username}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{getRoleName(user?.role || '')}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

