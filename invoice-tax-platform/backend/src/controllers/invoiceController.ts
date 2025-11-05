import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';
import { generateInvoiceFingerprint, generateBlockchainTxHash } from '../utils/crypto';
import { logger } from '../utils/logger';
import { Invoice } from '../types';

// 模拟税务查验接口
async function verifyInvoiceWithTaxAuthority(
  invoiceCode: string,
  invoiceNo: string,
  amount: number,
  date: string
): Promise<{ status: string; result: string }> {
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 模拟查验结果（90%通过率）
  const random = Math.random();
  if (random < 0.9) {
    return {
      status: 'verified',
      result: '发票查验通过，状态正常'
    };
  } else if (random < 0.95) {
    return {
      status: 'invalid',
      result: '查无此票'
    };
  } else {
    return {
      status: 'cancelled',
      result: '发票已作废'
    };
  }
}

// 模拟OCR识别
function simulateOCR(imageData: string): Partial<Invoice> {
  // 随机生成发票信息
  const invoiceCode = String(Math.floor(Math.random() * 900000000000) + 100000000000);
  const invoiceNo = String(Math.floor(Math.random() * 90000000) + 10000000);
  const amount = Math.floor(Math.random() * 900000) + 10000;
  const taxRate = [0.03, 0.06, 0.09, 0.13][Math.floor(Math.random() * 4)];
  const taxAmount = Math.round(amount * taxRate * 100) / 100;
  const totalAmount = amount + taxAmount;
  const issueDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    invoiceCode,
    invoiceNo,
    amount,
    taxRate,
    taxAmount,
    totalAmount,
    issueDate,
    invoiceType: ['special', 'normal', 'electronic'][Math.floor(Math.random() * 3)] as any
  };
}

export async function uploadInvoice(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { imageData, manualData } = req.body;

    // OCR识别（如果有图片）
    let ocrResult: Partial<Invoice> = {};
    if (imageData) {
      ocrResult = simulateOCR(imageData);
    }

    // 合并手动录入和OCR结果
    const invoiceData = {
      ...ocrResult,
      ...manualData,
      invoiceCode: manualData?.invoiceCode || ocrResult.invoiceCode || '',
      invoiceNo: manualData?.invoiceNo || ocrResult.invoiceNo || '',
      amount: manualData?.amount || ocrResult.amount || 0,
      issueDate: manualData?.issueDate || ocrResult.issueDate || new Date().toISOString().split('T')[0],
    };

    // 生成指纹
    const fingerprint = generateInvoiceFingerprint(
      invoiceData.invoiceCode,
      invoiceData.invoiceNo,
      invoiceData.amount,
      invoiceData.issueDate
    );

    // 检查是否重复
    const existingInvoice = await storage.findInvoiceByFingerprint(fingerprint);
    if (existingInvoice) {
      return res.status(400).json({ error: '该发票已存在，不能重复上传' });
    }

    // 税务查验
    const verifyResult = await verifyInvoiceWithTaxAuthority(
      invoiceData.invoiceCode,
      invoiceData.invoiceNo,
      invoiceData.amount,
      invoiceData.issueDate
    );

    // 评估风险等级
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const riskReasons: string[] = [];
    
    if (verifyResult.status !== 'verified') {
      riskLevel = 'high';
      riskReasons.push('税务查验未通过');
    }

    // 创建发票记录
    const invoice = await storage.createInvoice({
      ...invoiceData,
      fingerprint,
      verifyStatus: verifyResult.status as any,
      verifyResult: verifyResult.result,
      verifyTime: new Date().toISOString(),
      uploadedBy: userId,
      riskLevel,
      riskReasons,
      ocrResult: ocrResult as any,
      imageUrl: imageData ? `data:image/jpeg;base64,${imageData.substring(0, 100)}...` : undefined,
      seller: manualData?.seller || {
        name: '示例供应商有限公司',
        taxNo: '91110000MA01234567'
      },
      buyer: manualData?.buyer || {
        name: '示例采购企业有限公司',
        taxNo: '91110000MA01234568'
      },
      taxRate: invoiceData.taxRate || 0.13,
      taxAmount: invoiceData.taxAmount || 0,
      totalAmount: invoiceData.totalAmount || invoiceData.amount || 0,
      invoiceType: invoiceData.invoiceType || 'normal'
    });

    // 上链存证（模拟）
    const txHash = generateBlockchainTxHash();
    await storage.updateInvoice(invoice.id, {
      blockchainTxHash: txHash,
      blockchainHeight: Math.floor(Math.random() * 1000000) + 1000000
    });

    logger.info(`发票上传: ${invoice.invoiceCode}-${invoice.invoiceNo}`);

    res.status(201).json({ data: invoice });
  } catch (error: any) {
    logger.error('上传发票失败:', error);
    res.status(500).json({ error: '上传发票失败' });
  }
}

export async function getInvoices(req: AuthRequest, res: Response) {
  try {
    const {
      verifyStatus,
      matchStatus,
      riskLevel,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter: any = {};
    if (verifyStatus) filter.verifyStatus = verifyStatus;
    if (matchStatus) filter.matchStatus = matchStatus;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (startDate) filter.startDate = startDate as string;
    if (endDate) filter.endDate = endDate as string;
    if (search) filter.search = search as string;

    const invoices = await storage.findInvoices(filter);
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
    logger.error('获取发票列表失败:', error);
    res.status(500).json({ error: '获取发票列表失败' });
  }
}

export async function getInvoice(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const invoice = await storage.findInvoice(id);
    
    if (!invoice) {
      return res.status(404).json({ error: '发票不存在' });
    }

    res.json({ data: invoice });
  } catch (error: any) {
    logger.error('获取发票详情失败:', error);
    res.status(500).json({ error: '获取发票详情失败' });
  }
}

export async function verifyInvoice(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const invoice = await storage.findInvoice(id);
    
    if (!invoice) {
      return res.status(404).json({ error: '发票不存在' });
    }

    // 重新查验
    const verifyResult = await verifyInvoiceWithTaxAuthority(
      invoice.invoiceCode,
      invoice.invoiceNo,
      invoice.amount,
      invoice.issueDate
    );

    await storage.updateInvoice(id, {
      verifyStatus: verifyResult.status as any,
      verifyResult: verifyResult.result,
      verifyTime: new Date().toISOString()
    });

    const updatedInvoice = await storage.findInvoice(id);
    res.json({ data: updatedInvoice });
  } catch (error: any) {
    logger.error('发票查验失败:', error);
    res.status(500).json({ error: '发票查验失败' });
  }
}

