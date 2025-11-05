import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space } from 'antd';
import {
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { api } from '@/services/api';
import { certificateService } from '@/services/certificateService';
import { financingService } from '@/services/financingService';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);
  const [recentFinancing, setRecentFinancing] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, certRes, finRes] = await Promise.all([
        api.get('/dashboard/stats'),
        certificateService.getCertificates({ limit: 5 }),
        financingService.getApplications(),
      ]);

      setStats(statsRes.data);
      setRecentCertificates(certRes.certificates);
      setRecentFinancing(finRes.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const certificateColumns = [
    {
      title: '凭证编号',
      dataIndex: 'certificate_id',
      key: 'certificate_id',
    },
    {
      title: '金额',
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          holding: { color: 'blue', text: '持有中' },
          transferred: { color: 'green', text: '已转让' },
          pledged: { color: 'orange', text: '已质押' },
          redeemed: { color: 'purple', text: '已核销' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '到期日期',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  const financingColumns = [
    {
      title: '申请编号',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.substring(0, 8) + '...',
    },
    {
      title: '融资金额',
      dataIndex: 'financing_amount',
      key: 'financing_amount',
      render: (amount: number) => `¥${amount.toLocaleString()}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'orange', text: '待审批' },
          approved: { color: 'blue', text: '已批准' },
          rejected: { color: 'red', text: '已拒绝' },
          disbursed: { color: 'green', text: '已放款' },
        };
        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        仪表盘
      </h1>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="凭证总数"
              value={stats?.certificates?.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="持有中"
              value={stats?.certificates?.holding || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="融资申请"
              value={stats?.financing?.total || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审批"
              value={stats?.financing?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近凭证" style={{ height: '100%' }}>
            <Table
              columns={certificateColumns}
              dataSource={recentCertificates}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近融资申请" style={{ height: '100%' }}>
            <Table
              columns={financingColumns}
              dataSource={recentFinancing}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

