import bcrypt from 'bcryptjs';
import { storage } from '../storage/fileStorage';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

// 中文姓名库
const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧'];
const givenNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀', '霞', '平', '刚', '桂', '英', '华', '文', '红', '建', '鹏', '飞', '辉', '雪'];

// 门店名称
const storeNames = [
  '华联商厦', '沃尔玛超市', '家乐福', '大润发', '永辉超市', '世纪联华', '物美超市', '苏宁易购', '国美电器', '京东商城',
  '天猫超市', '盒马鲜生', '7-ELEVEN', '全家便利店', '罗森便利店', '美宜佳', '屈臣氏', '万宁', '来伊份', '良品铺子',
];

// 机构名称
const companyNames = [
  '深圳华联股份有限公司', '北京物美商业集团', '上海永辉超市有限公司', '杭州大润发商贸有限公司', '成都世纪联华连锁超市',
  '广州苏宁易购销售有限公司', '北京国美电器有限公司', '上海盒马网络科技有限公司', '杭州来伊份食品有限公司', '武汉良品铺子食品有限公司',
  '深圳沃尔玛百货零售有限公司', '上海家乐福超市有限公司', '北京京东世纪贸易有限公司', '杭州天猫网络技术有限公司', '深圳7-ELEVEN连锁便利店',
];

// 生成随机中文姓名
function generateChineseName(): string {
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const givenName1 = givenNames[Math.floor(Math.random() * givenNames.length)];
  const givenName2 = Math.random() > 0.5 ? givenNames[Math.floor(Math.random() * givenNames.length)] : '';
  return surname + givenName1 + givenName2;
}

// 生成订单号
function generateOrderId(source: string, date: string): string {
  const prefix = {
    POS: 'POS',
    ECOM: 'ECOM',
    O2O: 'O2O',
    MEMBER: 'MEM',
    PROCUREMENT: 'PRO',
  }[source] || 'ORD';
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${date.replace(/-/g, '')}-${timestamp}-${random}`;
}

// 生成支付流水号
function generateChannelOrderNo(channel: string): string {
  const prefix = {
    WECHAT: 'WX',
    ALIPAY: 'ALI',
    BANK_CARD: 'BC',
    E_CNY: 'ECNY',
  }[channel] || 'PAY';
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// 生成业务记录
function generateBusinessRecord(date: string, index: number) {
  const sources: any[] = ['POS', 'ECOM', 'O2O', 'MEMBER', 'PROCUREMENT'];
  const paymentMethods: any[] = ['WECHAT', 'ALIPAY', 'BANK_CARD', 'E_CNY'];
  
  const source = sources[Math.floor(Math.random() * sources.length)];
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  const storeId = `STORE-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`;
  const storeName = storeNames[Math.floor(Math.random() * storeNames.length)];
  const orderId = generateOrderId(source, date);
  
  // 生成金额（10-5000元）
  const amount = Math.round((Math.random() * 4990 + 10) * 100) / 100;
  
  // 生成时间（当天的随机时间）
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  const millisecond = Math.floor(Math.random() * 1000);
  const businessTime = `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.${String(millisecond).padStart(3, '0')}Z`;

  return {
    recordId: `BIZ-${date.replace(/-/g, '')}-${String(index + 1).padStart(6, '0')}`,
    source,
    storeId,
    storeName,
    orderId,
    amount,
    currency: 'CNY',
    paymentMethod,
    businessTime,
    operator: `USER-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
    operatorName: generateChineseName(),
    customerId: Math.random() > 0.3 ? `CUST-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : undefined,
    customerName: Math.random() > 0.3 ? generateChineseName() : undefined,
  };
}

// 生成支付记录
function generatePaymentRecord(date: string, businessRecord: any, index: number) {
  const channel = businessRecord.paymentMethod;
  
  // 计算手续费（e-CNY为0，其他0.3%-0.6%）
  const feeRate = channel === 'E_CNY' ? 0 : (Math.random() * 0.003 + 0.003);
  const fee = Math.round(businessRecord.amount * feeRate * 100) / 100;
  const payAmount = businessRecord.amount - fee;
  
  // 支付时间比业务时间晚1-5秒
  const businessTime = new Date(businessRecord.businessTime);
  const payTimeOffset = Math.floor(Math.random() * 4000 + 1000);
  const payTime = new Date(businessTime.getTime() + payTimeOffset).toISOString();
  
  // 95%的概率支付成功
  const payStatus = Math.random() > 0.05 ? 'SUCCESS' : 'FAILED';

  return {
    recordId: `PAY-${date.replace(/-/g, '')}-${String(index + 1).padStart(6, '0')}`,
    channel,
    merchantOrderNo: businessRecord.orderId,
    channelOrderNo: generateChannelOrderNo(channel),
    payAmount: payStatus === 'SUCCESS' ? payAmount : 0,
    fee,
    payTime,
    payStatus,
  };
}

// 生成模拟数据
async function seed() {
  console.log('开始生成模拟数据...');

  // 创建默认用户
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await storage.createUser({
    email: 'admin@reconciliation.com',
    password: hashedPassword,
    name: '系统管理员',
    role: 'ADMIN',
  });
  console.log('创建默认用户:', adminUser.email);

  // 生成最近30天的数据（包括今天）
  const days = 30;
  let totalBusinessRecords = 0;
  let totalPaymentRecords = 0;

  // 从今天开始，往前生成30天数据
  for (let day = 0; day < days; day++) {
    const date = dayjs().subtract(day, 'day').format('YYYY-MM-DD');
    const recordsPerDay = Math.floor(Math.random() * 500 + 200); // 每天200-700笔

    console.log(`生成 ${date} 的数据，共 ${recordsPerDay} 笔...`);

    // 生成业务记录
    const businessRecords: any[] = [];
    for (let i = 0; i < recordsPerDay; i++) {
      const recordData = generateBusinessRecord(date, i);
      const createdRecord = await storage.createBusinessRecord(recordData);
      businessRecords.push(createdRecord);
      totalBusinessRecords++;
    }

    // 生成支付记录（95%匹配业务记录，5%为长款）
    const matchedCount = Math.floor(recordsPerDay * 0.95);
    const longAmountCount = recordsPerDay - matchedCount;

    for (let i = 0; i < matchedCount; i++) {
      const businessRecord = businessRecords[i];
      const paymentRecordData = generatePaymentRecord(date, businessRecord, i);
      const paymentRecord = await storage.createPaymentRecord(paymentRecordData);
      totalPaymentRecords++;

      // 95%创建匹配的对账记录
      if (Math.random() > 0.05) {
        await storage.createReconciliationRecord({
          recordId: `RECON-${date.replace(/-/g, '')}-${String(i + 1).padStart(6, '0')}`,
          reconDate: date,
          businessRecordId: businessRecord.id,
          paymentRecordId: paymentRecord.id,
          matchStatus: 'MATCHED',
          matchRule: 'exact',
          matchTime: paymentRecord.payTime,
        });
      } else {
        // 5%创建未匹配的对账记录和差异工单
        await storage.createReconciliationRecord({
          recordId: `RECON-${date.replace(/-/g, '')}-${String(i + 1).padStart(6, '0')}`,
          reconDate: date,
          businessRecordId: businessRecord.id,
          paymentRecordId: paymentRecord.id,
          matchStatus: 'UNMATCHED',
        });
        await storage.createDiscrepancyTicket({
          ticketId: `TICKET-${date.replace(/-/g, '')}-${String(i + 1).padStart(6, '0')}`,
          type: Math.random() > 0.5 ? 'AMOUNT_DIFF' : 'TIME_DIFF',
          businessRecordId: businessRecord.id,
          paymentRecordId: paymentRecord.id,
          amount: businessRecord.amount,
          diffAmount: Math.random() * 10,
          status: Math.random() > 0.7 ? 'RESOLVED' : 'PENDING',
          description: '金额或时间存在差异',
        });
      }
    }
    
    // 为剩余的业务记录创建未匹配的对账记录
    for (let i = matchedCount; i < recordsPerDay; i++) {
      const businessRecord = businessRecords[i];
      await storage.createReconciliationRecord({
        recordId: `RECON-${date.replace(/-/g, '')}-${String(i + 1).padStart(6, '0')}`,
        reconDate: date,
        businessRecordId: businessRecord.id,
        matchStatus: 'UNMATCHED',
      });
    }

    // 生成长款支付记录
    for (let i = 0; i < longAmountCount; i++) {
      const fakeBusinessRecordData = generateBusinessRecord(date, matchedCount + i);
      const paymentRecordData = generatePaymentRecord(date, fakeBusinessRecordData, matchedCount + i);
      const paymentRecord = await storage.createPaymentRecord(paymentRecordData);
      totalPaymentRecords++;

      // 创建长款差异工单
      await storage.createDiscrepancyTicket({
        ticketId: `TICKET-${date.replace(/-/g, '')}-LONG-${String(i + 1).padStart(6, '0')}`,
        type: 'LONG_AMOUNT',
        paymentRecordId: paymentRecord.id,
        amount: paymentRecord.payAmount,
        status: 'PENDING',
        description: '支付记录未找到匹配的业务记录',
      });
    }

    // 生成部分清分记录
    if (Math.random() > 0.7 && matchedCount > 0) {
      const selectedRecord = businessRecords[Math.floor(Math.random() * matchedCount)];
      const splits = [
        {
          account: 'platform',
          accountName: '平台账户',
          type: 'PERCENTAGE',
          value: 5,
          amount: selectedRecord.amount * 0.05,
          description: '平台服务费',
        },
        {
          account: 'merchant',
          accountName: '商户账户',
          type: 'REMAINDER',
          amount: selectedRecord.amount * 0.95,
          description: '商户货款',
        },
      ];

      await storage.createSettlementRecord({
        settlementId: `SETTLE-${date.replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
        orderId: selectedRecord.orderId,
        totalAmount: selectedRecord.amount,
        splits,
        settlementTime: selectedRecord.businessTime,
        status: 'SUCCESS',
        blockchainTxHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      });
    }
  }

  console.log('数据生成完成！');
  console.log(`- 业务记录: ${totalBusinessRecords} 笔`);
  console.log(`- 支付记录: ${totalPaymentRecords} 笔`);
  console.log(`- 默认登录账号: admin@reconciliation.com`);
  console.log(`- 默认密码: admin123`);
}

seed().catch(console.error);

