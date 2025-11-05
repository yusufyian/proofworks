import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { reimbursementApi } from '../api/reimbursements';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ReimbursementDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery(
    ['reimbursement', id],
    () => reimbursementApi.getDetail(id!),
    { enabled: !!id }
  );

  const reimbursement = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!reimbursement) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">报销申请不存在</p>
        <Link to="/reimbursements" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          返回报销列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/reimbursements"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold gradient-text">报销详情</h1>
          <p className="text-gray-600 mt-1">{reimbursement.reimbursementNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6">基本信息</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">申请人</label>
                <p className="font-semibold text-lg">{reimbursement.applicantName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">部门</label>
                <p className="font-semibold text-lg">{reimbursement.department}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">费用类型</label>
                <p className="font-semibold">
                  {reimbursement.expenseType === 'travel' ? '差旅费' :
                   reimbursement.expenseType === 'meals' ? '餐费' :
                   reimbursement.expenseType === 'office' ? '办公费' :
                   reimbursement.expenseType === 'entertainment' ? '招待费' : '其他'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">申请时间</label>
                <p className="font-semibold">
                  {reimbursement.createdAt ? format(new Date(reimbursement.createdAt), 'yyyy-MM-dd HH:mm') : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-500">说明</label>
                <p className="font-semibold">{reimbursement.description}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">关联发票</h2>
            <div className="space-y-3">
              {reimbursement.invoices && reimbursement.invoices.length > 0 ? (
                reimbursement.invoices.map((invoiceId: string) => (
                  <Link
                    key={invoiceId}
                    to={`/invoices/${invoiceId}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-indigo-600">发票ID: {invoiceId}</div>
                    <div className="text-sm text-gray-500 mt-1">点击查看详情</div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">暂无关联发票</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-6">金额信息</h2>
            <div className="space-y-4">
              <div className="pt-4 border-t border-gray-200">
                <label className="text-sm text-gray-500">报销总额</label>
                <p className="font-bold text-3xl text-indigo-600">¥{(reimbursement.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">审批流程</h2>
            <div className="space-y-4">
              {reimbursement.approvalFlow && reimbursement.approvalFlow.map((node: any, index: number) => {
                const getStatusIcon = () => {
                  if (node.status === 'approved') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
                  if (node.status === 'rejected') return <XCircle className="w-5 h-5 text-red-600" />;
                  return <Clock className="w-5 h-5 text-yellow-600" />;
                };
                return (
                  <div key={index} className="flex items-start space-x-3">
                    {getStatusIcon()}
                    <div className="flex-1">
                      <div className="font-semibold">{node.approverName}</div>
                      <div className="text-sm text-gray-500">
                        {node.status === 'approved' ? '已批准' :
                         node.status === 'rejected' ? '已拒绝' : '待审批'}
                      </div>
                      {node.approveTime && (
                        <div className="text-xs text-gray-400 mt-1">
                          {format(new Date(node.approveTime), 'yyyy-MM-dd HH:mm')}
                        </div>
                      )}
                      {node.comment && (
                        <div className="text-sm text-gray-600 mt-1">{node.comment}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold mb-6">状态信息</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">审批状态</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  reimbursement.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                  reimbursement.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {reimbursement.approvalStatus === 'approved' ? '已批准' :
                   reimbursement.approvalStatus === 'rejected' ? '已拒绝' : '待审批'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">支付状态</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  reimbursement.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                  reimbursement.paymentStatus === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {reimbursement.paymentStatus === 'paid' ? '已支付' :
                   reimbursement.paymentStatus === 'cancelled' ? '已取消' : '待支付'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

