import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// 模拟OCR识别接口
export async function recognizeInvoice(req: AuthRequest, res: Response) {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: '请提供图片数据' });
    }

    // 模拟OCR处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟OCR识别结果
    const invoiceCode = String(Math.floor(Math.random() * 900000000000) + 100000000000);
    const invoiceNo = String(Math.floor(Math.random() * 90000000) + 10000000);
    const amount = Math.floor(Math.random() * 900000) + 10000;
    const taxRate = [0.03, 0.06, 0.09, 0.13][Math.floor(Math.random() * 4)];
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = amount + taxAmount;
    const issueDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const ocrResult = {
      invoiceCode,
      invoiceNo,
      issueDate,
      seller: {
        name: '示例供应商有限公司',
        taxNo: '91110000MA01234567',
        address: '北京市朝阳区示例街道123号',
        phone: '010-12345678',
        bankAccount: '中国工商银行北京分行 1234567890123456789'
      },
      buyer: {
        name: '示例采购企业有限公司',
        taxNo: '91110000MA01234568',
        address: '上海市浦东新区示例路456号',
        phone: '021-87654321',
        bankAccount: '中国建设银行上海分行 9876543210987654321'
      },
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      invoiceType: ['special', 'normal', 'electronic'][Math.floor(Math.random() * 3)],
      items: [
        {
          name: '办公用品',
          specification: 'A4纸张',
          unit: '包',
          quantity: 10,
          unitPrice: amount / 10,
          amount: amount,
          taxRate,
          taxAmount
        }
      ],
      confidence: 0.95 + Math.random() * 0.05 // 95-100%置信度
    };

    res.json({ data: ocrResult });
  } catch (error: any) {
    res.status(500).json({ error: 'OCR识别失败' });
  }
}

