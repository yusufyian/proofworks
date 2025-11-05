import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';
import { generateBlockchainTxHash } from '../utils/crypto';

export async function createSalesInvoice(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const {
      customerId,
      customerName,
      customerTaxNo,
      amount,
      taxRate,
      issueDate
    } = req.body;

    // 生成发票代码和号码（模拟）
    const invoiceCode = String(Math.floor(Math.random() * 900000000000) + 100000000000);
    const invoiceNo = String(Math.floor(Math.random() * 90000000) + 10000000);
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = amount + taxAmount;

    const salesInvoice = await storage.createSalesInvoice({
      invoiceCode,
      invoiceNo,
      invoiceType: 'electronic',
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      customerId,
      customerName,
      customerTaxNo,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'issued',
      issuedBy: userId,
      blockchainTxHash: generateBlockchainTxHash()
    });

    res.status(201).json({ data: salesInvoice });
  } catch (error: any) {
    res.status(500).json({ error: '开具发票失败' });
  }
}

export async function getSalesInvoices(req: AuthRequest, res: Response) {
  try {
    const {
      customerId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    const filter: any = {};
    if (customerId) filter.customerId = customerId;
    if (status) filter.status = status;
    if (startDate) filter.startDate = startDate as string;
    if (endDate) filter.endDate = endDate as string;

    const invoices = await storage.findSalesInvoices(filter);
    const total = invoices.length;
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginatedInvoices = invoices.slice(start, end);

    res.json({
      data: paginatedInvoices,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: '获取销售发票列表失败' });
  }
}

