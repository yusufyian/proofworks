import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';
import { v4 as uuidv4 } from 'uuid';

export async function createReimbursement(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { expenseType, description, invoices, totalAmount, department } = req.body;

    const user = await storage.findUser({ id: userId });
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 检查发票是否重复使用
    for (const invoiceId of invoices) {
      const invoice = await storage.findInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ error: `发票 ${invoiceId} 不存在` });
      }
      // 检查发票是否已在其他报销中使用
      const existingReimbursements = await storage.findReimbursements();
      const alreadyUsed = existingReimbursements.some(r => 
        r.invoices.includes(invoiceId) && r.id !== req.body.id
      );
      if (alreadyUsed) {
        return res.status(400).json({ error: `发票 ${invoice.invoiceCode}-${invoice.invoiceNo} 已被使用` });
      }
    }

    // 检查预算（模拟）
    const budgetCheckStatus = 'passed'; // 实际应该查询预算系统

    // 创建审批流程
    const approvalFlow = [
      {
        level: 1,
        approverId: 'manager-1',
        approverName: '部门主管',
        status: 'pending' as const
      },
      {
        level: 2,
        approverId: 'finance-1',
        approverName: '财务审核',
        status: 'pending' as const
      }
    ];

    // 如果金额超过5000，需要总经理审批
    if (totalAmount > 5000) {
      approvalFlow.push({
        level: 3,
        approverId: 'ceo-1',
        approverName: '总经理',
        status: 'pending' as const
      });
    }

    const reimbursement = await storage.createReimbursement({
      reimbursementNo: `REIM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      applicantId: userId,
      applicantName: user.name,
      department: department || user.department || '未分配部门',
      expenseType,
      description,
      invoices,
      totalAmount,
      budgetCheckStatus,
      approvalStatus: 'pending',
      approvalFlow,
      currentApprover: approvalFlow[0].approverId,
      paymentStatus: 'pending'
    });

    res.status(201).json({ data: reimbursement });
  } catch (error: any) {
    res.status(500).json({ error: '创建报销申请失败' });
  }
}

export async function getReimbursements(req: AuthRequest, res: Response) {
  try {
    const {
      applicantId,
      approvalStatus,
      paymentStatus,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter: any = {};
    if (applicantId) filter.applicantId = applicantId;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) filter.search = search;

    const reimbursements = await storage.findReimbursements(filter);
    const total = reimbursements.length;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginatedReimbursements = reimbursements.slice(start, end);

    res.json({
      data: paginatedReimbursements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取报销列表失败' });
  }
}

export async function getReimbursement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const reimbursement = await storage.findReimbursement(id);
    
    if (!reimbursement) {
      return res.status(404).json({ error: '报销申请不存在' });
    }

    res.json({ data: reimbursement });
  } catch (error: any) {
    res.status(500).json({ error: '获取报销详情失败' });
  }
}

export async function approveReimbursement(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { action, comment } = req.body; // action: 'approve' | 'reject'

    const reimbursement = await storage.findReimbursement(id);
    if (!reimbursement) {
      return res.status(404).json({ error: '报销申请不存在' });
    }

    if (reimbursement.approvalStatus !== 'pending') {
      return res.status(400).json({ error: '该报销申请已处理' });
    }

    const currentLevel = reimbursement.approvalFlow.findIndex(node => node.status === 'pending');
    if (currentLevel === -1) {
      return res.status(400).json({ error: '没有待审批的节点' });
    }

    const approvalFlow = [...reimbursement.approvalFlow];
    approvalFlow[currentLevel] = {
      ...approvalFlow[currentLevel],
      status: action === 'approve' ? 'approved' : 'rejected',
      approveTime: new Date().toISOString(),
      comment
    };

    let approvalStatus = reimbursement.approvalStatus;
    let paymentStatus = reimbursement.paymentStatus;

    if (action === 'reject') {
      approvalStatus = 'rejected';
    } else {
      // 检查是否所有节点都已批准
      const allApproved = approvalFlow.every(node => node.status === 'approved');
      if (allApproved) {
        approvalStatus = 'approved';
        paymentStatus = 'paid';
      } else {
        // 更新当前审批人
        const nextLevel = approvalFlow.findIndex(node => node.status === 'pending');
        if (nextLevel !== -1) {
          reimbursement.currentApprover = approvalFlow[nextLevel].approverId;
        }
      }
    }

    await storage.updateReimbursement(id, {
      approvalFlow,
      approvalStatus,
      paymentStatus,
      paymentTime: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
      rejectReason: action === 'reject' ? comment : undefined,
      currentApprover: reimbursement.currentApprover
    });

    const updated = await storage.findReimbursement(id);
    res.json({ data: updated });
  } catch (error: any) {
    res.status(500).json({ error: '审批失败' });
  }
}

