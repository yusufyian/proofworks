import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import storage from '../storage/fileStorage';

export async function performThreeWayMatch(req: AuthRequest, res: Response) {
  try {
    const { invoiceId, orderId, receiptId } = req.body;

    const invoice = await storage.findInvoice(invoiceId);
    const order = await storage.findPurchaseOrder(orderId);
    const receipt = await storage.findReceipt(receiptId);

    if (!invoice || !order || !receipt) {
      return res.status(404).json({ error: '发票、订单或入库单不存在' });
    }

    // 检查入库单是否属于该订单
    if (receipt.orderId !== order.id) {
      return res.status(400).json({ 
        error: '入库单不属于该采购订单',
        details: {
          receiptOrderId: receipt.orderId,
          selectedOrderId: order.id
        }
      });
    }

    // 获取订单供应商企业信息
    const supplierCompany = await storage.findCompany({ id: order.supplierId });
    if (!supplierCompany) {
      return res.status(400).json({ error: '订单供应商信息不存在' });
    }

    // 供应商匹配：发票销售方名称或税号应该与订单供应商一致
    const supplierMatch = invoice.seller.name === order.supplierName || 
                         invoice.seller.name === supplierCompany.name ||
                         invoice.seller.taxNo === supplierCompany.taxNumber ||
                         invoice.seller.taxNo === supplierCompany.unifiedSocialCreditCode;
    
    // 金额匹配：发票金额与订单金额差异不超过5%
    const orderAmount = order.totalAmount || 0;
    const invoiceAmount = invoice.totalAmount || 0;
    const amountDifference = Math.abs(invoiceAmount - orderAmount);
    const differencePercent = orderAmount > 0 ? (amountDifference / orderAmount) * 100 : 100;
    const amountMatch = differencePercent <= 5;

    // 入库单金额匹配：入库单金额与订单金额差异不超过5%
    const receiptAmount = receipt.totalAmount || 0;
    const receiptAmountDifference = Math.abs(receiptAmount - orderAmount);
    const receiptAmountPercent = orderAmount > 0 ? (receiptAmountDifference / orderAmount) * 100 : 100;
    const receiptAmountMatch = receiptAmountPercent <= 5;

    // 日期匹配（订单日期±30天）
    const orderDate = new Date(order.orderDate);
    const invoiceDate = new Date(invoice.issueDate);
    const daysDiff = Math.abs((invoiceDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    const dateMatch = daysDiff <= 30;

    // 明细匹配（简化版：检查是否有明细项）
    const hasInvoiceItems = invoice.items && invoice.items.length > 0;
    const hasOrderItems = order.items && order.items.length > 0;
    const itemMatch = hasInvoiceItems && hasOrderItems;

    // 计算匹配状态
    let matchStatus: 'matched' | 'partial' | 'unmatched';
    if (supplierMatch && amountMatch && receiptAmountMatch && dateMatch && itemMatch) {
      matchStatus = 'matched';
    } else if (supplierMatch && amountMatch && dateMatch) {
      matchStatus = 'partial'; // 部分匹配（供应商、金额、日期匹配，但可能明细不匹配）
    } else {
      matchStatus = 'unmatched';
    }

    const match = await storage.createThreeWayMatch({
      invoiceId,
      orderId,
      receiptId,
      matchStatus,
      matchDetails: {
        supplierMatch,
        amountMatch,
        receiptAmountMatch,
        itemMatch,
        dateMatch
      },
      amountDifference: invoiceAmount - orderAmount,
      differencePercent,
      matchTime: new Date().toISOString(),
      matchedBy: req.userId,
      notes: matchStatus === 'matched' 
        ? '三单匹配成功，所有验证项均通过' 
        : matchStatus === 'partial'
        ? `部分匹配：${!supplierMatch ? '供应商不匹配；' : ''}${!amountMatch ? '金额差异超过5%；' : ''}${!dateMatch ? '日期超出范围；' : ''}${!itemMatch ? '明细不匹配' : ''}`
        : '匹配失败，请检查单据关联关系'
    });

    // 更新发票匹配状态
    await storage.updateInvoice(invoiceId, {
      matchStatus,
      relatedOrderId: orderId,
      relatedReceiptId: receiptId
    });

    res.json({ data: match });
  } catch (error: any) {
    res.status(500).json({ error: '三单匹配失败' });
  }
}

export async function getMatches(req: AuthRequest, res: Response) {
  try {
    const { invoiceId } = req.query;
    const filter: any = {};
    if (invoiceId) filter.invoiceId = invoiceId;

    const matches = await storage.findThreeWayMatches(filter);
    res.json({ data: matches });
  } catch (error: any) {
    res.status(500).json({ error: '获取匹配记录失败' });
  }
}

