import { Response } from 'express';
import { storage } from '../storage/fileStorage';

export const getDiscrepancyTickets = async (req: any, res: Response) => {
  try {
    const { type, status, page = 1, pageSize = 20 } = req.query;

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    const tickets = await storage.findDiscrepancyTickets(filter);

    const start = (Number(page) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedTickets = tickets.slice(start, end);

    // 填充业务和支付记录详情
    const ticketsWithDetails = await Promise.all(
      paginatedTickets.map(async (ticket) => {
        const businessRecord = ticket.businessRecordId
          ? await storage.findBusinessRecord(ticket.businessRecordId)
          : null;
        const paymentRecord = ticket.paymentRecordId
          ? await storage.findPaymentRecord(ticket.paymentRecordId)
          : null;

        return {
          ...ticket,
          businessRecord,
          paymentRecord,
        };
      })
    );

    res.json({
      data: {
        tickets: ticketsWithDetails,
        total: tickets.length,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(tickets.length / Number(pageSize)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDiscrepancyTicket = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await storage.updateDiscrepancyTicket(id, updates);

    if (!ticket) {
      return res.status(404).json({ error: '差异工单不存在' });
    }

    res.json({ data: ticket });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDiscrepancyStats = async (req: any, res: Response) => {
  try {
    const allTickets = await storage.findDiscrepancyTickets();

    const stats = {
      total: allTickets.length,
      pending: allTickets.filter(t => t.status === 'PENDING').length,
      processing: allTickets.filter(t => t.status === 'PROCESSING').length,
      resolved: allTickets.filter(t => t.status === 'RESOLVED').length,
      closed: allTickets.filter(t => t.status === 'CLOSED').length,
      byType: {
        LONG_AMOUNT: allTickets.filter(t => t.type === 'LONG_AMOUNT').length,
        SHORT_AMOUNT: allTickets.filter(t => t.type === 'SHORT_AMOUNT').length,
        AMOUNT_DIFF: allTickets.filter(t => t.type === 'AMOUNT_DIFF').length,
        TIME_DIFF: allTickets.filter(t => t.type === 'TIME_DIFF').length,
        NOT_FOUND: allTickets.filter(t => t.type === 'NOT_FOUND').length,
      },
      totalAmount: allTickets.reduce((sum, t) => sum + t.amount, 0),
    };

    res.json({ data: stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

