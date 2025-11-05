import { Response } from 'express';
import { storage } from '../storage/fileStorage';
import dayjs from 'dayjs';

export const getReconciliationRecords = async (req: any, res: Response) => {
  try {
    const { reconDate, matchStatus, page = 1, pageSize = 20 } = req.query;
    
    const filter: any = {};
    if (reconDate) filter.reconDate = reconDate;
    if (matchStatus) filter.matchStatus = matchStatus;

    const records = await storage.findReconciliationRecords(filter);
    
    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedRecords = records.slice(start, end);

    // 填充业务和支付记录详情
    const recordsWithDetails = await Promise.all(
      paginatedRecords.map(async (record) => {
        const businessRecord = await storage.findBusinessRecord(record.businessRecordId);
        const paymentRecord = record.paymentRecordId
          ? await storage.findPaymentRecord(record.paymentRecordId)
          : null;

        return {
          ...record,
          businessRecord,
          paymentRecord,
        };
      })
    );

    res.json({
      data: {
        records: recordsWithDetails,
        total: records.length,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(records.length / Number(pageSize)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReconciliationSummary = async (req: any, res: Response) => {
  try {
    const { date } = req.query;
    const reconDate = date || dayjs().format('YYYY-MM-DD');
    
    const summary = await storage.getReconciliationSummary(reconDate);
    
    res.json({ data: summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const triggerReconciliation = async (req: any, res: Response) => {
  try {
    const { date } = req.body;
    const reconDate = date || dayjs().format('YYYY-MM-DD');

    // 获取当天的业务记录和支付记录
    const startOfDay = `${reconDate}T00:00:00.000Z`;
    const endOfDay = `${reconDate}T23:59:59.999Z`;

    const businessRecords = await storage.findBusinessRecords({
      startDate: startOfDay,
      endDate: endOfDay,
    });

    const paymentRecords = await storage.findPaymentRecords({
      startDate: startOfDay,
      endDate: endOfDay,
    });

    // 匹配逻辑
    const matchedPaymentIds = new Set<string>();
    const reconciliationRecords: any[] = [];

    for (const businessRecord of businessRecords) {
      let matched = false;
      let matchedPayment: any = null;
      let matchRule = '';

      // 规则1: 精确匹配（订单号 + 金额 + 时间±5秒）
      matchedPayment = paymentRecords.find(
        (pr) =>
          pr.merchantOrderNo === businessRecord.orderId &&
          Math.abs(pr.payAmount - businessRecord.amount) < 0.01 &&
          Math.abs(
            new Date(pr.payTime).getTime() - new Date(businessRecord.businessTime).getTime()
          ) < 5000 &&
          !matchedPaymentIds.has(pr.id)
      );

      if (matchedPayment) {
        matched = true;
        matchRule = 'exact';
      } else {
        // 规则2: 订单号匹配（允许手续费差异）
        matchedPayment = paymentRecords.find(
          (pr) =>
            pr.merchantOrderNo === businessRecord.orderId &&
            Math.abs(pr.payAmount - businessRecord.amount) < 1 &&
            !matchedPaymentIds.has(pr.id)
        );

        if (matchedPayment) {
          matched = true;
          matchRule = 'order_no';
        } else {
          // 规则3: 金额+时间窗口匹配（±30分钟）
          matchedPayment = paymentRecords.find(
            (pr) =>
              Math.abs(pr.payAmount - businessRecord.amount) < 0.01 &&
              Math.abs(
                new Date(pr.payTime).getTime() - new Date(businessRecord.businessTime).getTime()
              ) < 30 * 60 * 1000 &&
              !matchedPaymentIds.has(pr.id)
          );

          if (matchedPayment) {
            matched = true;
            matchRule = 'amount_time';
          }
        }
      }

      if (matched && matchedPayment) {
        matchedPaymentIds.add(matchedPayment.id);
        const timeDiff = Math.abs(
          new Date(matchedPayment.payTime).getTime() - new Date(businessRecord.businessTime).getTime()
        );
        const amountDiff = Math.abs(matchedPayment.payAmount - businessRecord.amount);

        const reconRecord = await storage.createReconciliationRecord({
          recordId: `RECON-${reconDate}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          reconDate,
          businessRecordId: businessRecord.id,
          paymentRecordId: matchedPayment.id,
          matchStatus: 'MATCHED',
          matchRule,
          matchTime: new Date().toISOString(),
          amountDiff: amountDiff > 0.01 ? amountDiff : undefined,
          timeDiff: timeDiff > 1000 ? timeDiff : undefined,
        });

        reconciliationRecords.push(reconRecord);
      } else {
        // 未匹配，创建差异工单
        const ticket = await storage.createDiscrepancyTicket({
          ticketId: `TICKET-${reconDate}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'SHORT_AMOUNT',
          businessRecordId: businessRecord.id,
          amount: businessRecord.amount,
          status: 'PENDING',
          description: `业务记录 ${businessRecord.orderId} 未找到匹配的支付记录`,
        });

        await storage.createReconciliationRecord({
          recordId: `RECON-${reconDate}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          reconDate,
          businessRecordId: businessRecord.id,
          matchStatus: 'UNMATCHED',
        });
      }
    }

    // 处理长款（支付有记录，业务无记录）
    for (const paymentRecord of paymentRecords) {
      if (!matchedPaymentIds.has(paymentRecord.id)) {
        const ticket = await storage.createDiscrepancyTicket({
          ticketId: `TICKET-${reconDate}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'LONG_AMOUNT',
          paymentRecordId: paymentRecord.id,
          amount: paymentRecord.payAmount,
          status: 'PENDING',
          description: `支付记录 ${paymentRecord.channelOrderNo} 未找到匹配的业务记录`,
        });
      }
    }

    const summary = await storage.getReconciliationSummary(reconDate);

    res.json({
      data: {
        message: '对账完成',
        summary,
        processedRecords: businessRecords.length,
        matchedRecords: reconciliationRecords.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

