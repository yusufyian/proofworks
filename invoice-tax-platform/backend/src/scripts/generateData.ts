import bcrypt from 'bcryptjs';
import storage from '../storage/fileStorage';
import { generateInvoiceFingerprint, generateBlockchainTxHash } from '../utils/crypto';
import dayjs from 'dayjs';

// 中文姓名库
const chineseNames = [
  '张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵敏', '黄磊', '周杰', '吴刚',
  '徐静', '朱军', '马超', '胡军', '林峰', '何洁', '罗志', '高强', '梁超', '郑华',
  '谢娜', '韩红', '唐嫣', '冯巩', '于谦', '董卿', '袁泉', '邓超', '许晴', '孙俪',
  '佟大为', '陈道明', '张国立', '葛优', '姜文', '章子怡', '范冰冰', '李冰冰', '周迅', '赵薇'
];

// 企业名称库
const companyNames = [
  '北京科技有限公司', '上海贸易有限公司', '广州电子有限公司', '深圳信息技术有限公司',
  '杭州软件有限公司', '成都物流有限公司', '武汉制造有限公司', '西安设备有限公司',
  '南京实业有限公司', '天津化工有限公司', '重庆材料有限公司', '苏州精密有限公司',
  '无锡机械有限公司', '宁波船舶有限公司', '青岛食品有限公司', '大连港口有限公司',
  '厦门旅游有限公司', '长沙文化有限公司', '郑州能源有限公司', '济南建设有限公司',
  '石家庄医疗有限公司', '太原矿业有限公司', '呼和浩特农业有限公司', '沈阳汽车有限公司',
  '长春医药有限公司', '哈尔滨电力有限公司', '合肥新能源有限公司', '福州房地产有限公司',
  '南昌教育有限公司', '济南金融有限公司', '郑州交通有限公司', '长沙科技股份有限公司'
];

// 部门名称
const departments = [
  '财务部', '采购部', '销售部', '人事部', '行政部', '研发部', '市场部', '运营部',
  '客服部', '物流部', '质量部', '法务部', '审计部', 'IT部', '生产部', '工程部'
];

// 费用类型
const expenseTypes = ['travel', 'meals', 'office', 'entertainment', 'other'];

// 生成随机企业名称
function generateCompanyName(): string {
  const prefix = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '天津'][
    Math.floor(Math.random() * 10)
  ];
  const suffix = companyNames[Math.floor(Math.random() * companyNames.length)];
  return prefix + suffix;
}

// 生成统一社会信用代码（18位）
function generateTaxNumber(): string {
  const prefix = '91110000';
  const middle = String(Math.floor(Math.random() * 900000) + 100000);
  const suffix = String(Math.floor(Math.random() * 9000) + 1000);
  return prefix + middle + suffix;
}

// 生成发票代码（12位）
function generateInvoiceCode(): string {
  return String(Math.floor(Math.random() * 900000000000) + 100000000000);
}

// 生成发票号码（8位）
function generateInvoiceNo(): string {
  return String(Math.floor(Math.random() * 90000000) + 10000000);
}

// 生成日期（过去90天内）
function generateDate(daysAgo: number = 0): string {
  return dayjs().subtract(daysAgo, 'day').format('YYYY-MM-DD');
}

async function generateUsers() {
  console.log('生成用户数据...');
  const roles: Array<'finance' | 'employee' | 'manager' | 'admin'> = ['finance', 'employee', 'manager', 'admin'];
  
  for (let i = 0; i < 50; i++) {
    const name = chineseNames[Math.floor(Math.random() * chineseNames.length)];
    const email = `user${i + 1}@example.com`;
    const password = await bcrypt.hash('123456', 10);
    const role = roles[Math.floor(Math.random() * roles.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];

    await storage.createUser({
      email,
      password,
      name,
      role,
      department
    });
  }
  
  // 创建默认管理员
  await storage.createUser({
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    name: '系统管理员',
    role: 'admin',
    department: 'IT部'
  });

  console.log('用户数据生成完成');
}

async function generateCompanies() {
  console.log('生成企业数据...');
  
  for (let i = 0; i < 30; i++) {
    const name = generateCompanyName();
    const taxNumber = generateTaxNumber();
    const type: 'buyer' | 'seller' | 'both' = ['buyer', 'seller', 'both'][Math.floor(Math.random() * 3)] as any;

    await storage.createCompany({
      name,
      unifiedSocialCreditCode: taxNumber,
      taxNumber,
      address: `北京市朝阳区示例街道${Math.floor(Math.random() * 999) + 1}号`,
      phone: `010-${Math.floor(Math.random() * 90000000) + 10000000}`,
      type
    });
  }

  console.log('企业数据生成完成');
}

async function generateInvoices() {
  console.log('生成发票数据...');
  const users = await storage.findAllUsers();
  const companies = await storage.findAllCompanies();
  
  if (users.length === 0 || companies.length === 0) {
    console.log('请先生成用户和企业数据');
    return;
  }

  for (let i = 0; i < 500; i++) {
    const invoiceCode = generateInvoiceCode();
    const invoiceNo = generateInvoiceNo();
    const amount = Math.floor(Math.random() * 900000) + 10000;
    const taxRate = [0.03, 0.06, 0.09, 0.13][Math.floor(Math.random() * 4)];
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = amount + taxAmount;
    const issueDate = generateDate(Math.floor(Math.random() * 90));
    
    const fingerprint = generateInvoiceFingerprint(invoiceCode, invoiceNo, amount, issueDate);
    
    const seller = companies[Math.floor(Math.random() * companies.length)];
    const buyer = companies[Math.floor(Math.random() * companies.length)];
    const uploadedBy = users[Math.floor(Math.random() * users.length)].id;
    
    // 90%通过率
    const verifyStatus = Math.random() < 0.9 ? 'verified' : 
                        Math.random() < 0.95 ? 'invalid' : 'cancelled';
    
    // 风险等级
    const riskLevel = verifyStatus === 'verified' 
      ? (Math.random() < 0.8 ? 'low' : Math.random() < 0.9 ? 'medium' : 'high')
      : 'high';
    
    // 匹配状态（50%已匹配）
    const matchStatus = Math.random() < 0.5 ? 'matched' : 
                       Math.random() < 0.3 ? 'partial' : 'unmatched';

    await storage.createInvoice({
      invoiceCode,
      invoiceNo,
      invoiceType: ['special', 'normal', 'electronic'][Math.floor(Math.random() * 3)] as any,
      issueDate,
      seller: {
        name: seller.name,
        taxNo: seller.taxNumber,
        address: seller.address,
        phone: seller.phone
      },
      buyer: {
        name: buyer.name,
        taxNo: buyer.taxNumber || generateTaxNumber(),
        address: `北京市海淀区示例路${Math.floor(Math.random() * 999) + 1}号`,
        phone: `010-${Math.floor(Math.random() * 90000000) + 10000000}`
      },
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      fingerprint,
      verifyStatus: verifyStatus as any,
      verifyResult: verifyStatus === 'verified' ? '发票查验通过，状态正常' : 
                   verifyStatus === 'invalid' ? '查无此票' : '发票已作废',
      verifyTime: new Date().toISOString(),
      uploadedBy,
      matchStatus: matchStatus as any,
      riskLevel: riskLevel as any,
      riskReasons: riskLevel === 'high' ? ['税务查验未通过'] : [],
      blockchainTxHash: generateBlockchainTxHash(),
      blockchainHeight: Math.floor(Math.random() * 1000000) + 1000000
    });
  }

  console.log('发票数据生成完成');
}

async function generatePurchaseOrders() {
  console.log('生成采购订单数据...');
  const companies = await storage.findAllCompanies();
  
  if (companies.length === 0) {
    console.log('请先生成企业数据');
    return;
  }

  for (let i = 0; i < 200; i++) {
    const supplier = companies[Math.floor(Math.random() * companies.length)];
    const buyer = companies[Math.floor(Math.random() * companies.length)];
    const orderDate = generateDate(Math.floor(Math.random() * 90));
    
    const items = [];
    let totalAmount = 0;
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < itemCount; j++) {
      const quantity = Math.floor(Math.random() * 100) + 1;
      const unitPrice = Math.floor(Math.random() * 1000) + 10;
      const amount = quantity * unitPrice;
      totalAmount += amount;
      
      items.push({
        name: ['办公用品', '原材料', '设备', '服务', '软件'][Math.floor(Math.random() * 5)],
        specification: '标准规格',
        unit: ['件', '套', '台', '次', '个'][Math.floor(Math.random() * 5)],
        quantity,
        unitPrice,
        amount
      });
    }

    const statuses: Array<'pending' | 'confirmed' | 'delivered' | 'completed' | 'cancelled'> = 
      ['pending', 'confirmed', 'delivered', 'completed', 'cancelled'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await storage.createPurchaseOrder({
      orderNo: `PO-${dayjs(orderDate).format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      orderDate,
      items,
      totalAmount,
      status
    });
  }

  console.log('采购订单数据生成完成');
}

async function generateReceipts() {
  console.log('生成入库单数据...');
  const orders = await storage.findPurchaseOrders();
  const companies = await storage.findAllCompanies();
  
  if (orders.length === 0) {
    console.log('请先生成采购订单数据');
    return;
  }

  for (let i = 0; i < 150; i++) {
    const order = orders[Math.floor(Math.random() * orders.length)];
    const receiptDate = generateDate(Math.floor(Math.random() * 30));
    
    const items = order.items.map(item => ({
      ...item,
      quantity: item.quantity * (0.95 + Math.random() * 0.1) // 允许5%差异
    }));
    
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const statuses: Array<'pending' | 'verified' | 'completed'> = ['pending', 'verified', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await storage.createReceipt({
      receiptNo: `REC-${dayjs(receiptDate).format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      orderId: order.id,
      orderNo: order.orderNo,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      receiptDate,
      items,
      totalAmount,
      status
    });
  }

  console.log('入库单数据生成完成');
}

async function generateReimbursements() {
  console.log('生成报销数据...');
  const users = await storage.findAllUsers();
  const invoices = await storage.findInvoices();
  
  if (users.length === 0 || invoices.length === 0) {
    console.log('请先生成用户和发票数据');
    return;
  }

  for (let i = 0; i < 300; i++) {
    const applicant = users[Math.floor(Math.random() * users.length)];
    const invoiceCount = Math.floor(Math.random() * 5) + 1;
    const selectedInvoices: string[] = [];
    
    // 随机选择发票
    for (let j = 0; j < invoiceCount && j < invoices.length; j++) {
      const invoice = invoices[Math.floor(Math.random() * invoices.length)];
      if (!selectedInvoices.includes(invoice.id)) {
        selectedInvoices.push(invoice.id);
      }
    }
    
    const totalAmount = selectedInvoices.reduce((sum, invId) => {
      const inv = invoices.find(i => i.id === invId);
      return sum + (inv?.totalAmount || 0);
    }, 0);
    
    const expenseType: 'travel' | 'meals' | 'office' | 'entertainment' | 'other' = 
      expenseTypes[Math.floor(Math.random() * expenseTypes.length)] as 'travel' | 'meals' | 'office' | 'entertainment' | 'other';
    const budgetCheckStatus: 'pending' | 'passed' | 'failed' = 
      Math.random() < 0.9 ? 'passed' : Math.random() < 0.5 ? 'pending' : 'failed';
    
    const approvalStatuses: Array<'pending' | 'approved' | 'rejected'> = 
      ['pending', 'approved', 'rejected'];
    const approvalStatus = approvalStatuses[Math.floor(Math.random() * approvalStatuses.length)];
    
    const paymentStatuses: Array<'pending' | 'paid' | 'cancelled'> = 
      ['pending', 'paid', 'cancelled'];
    const paymentStatus = approvalStatus === 'approved' && Math.random() < 0.8 
      ? 'paid' 
      : approvalStatus === 'rejected' 
      ? 'cancelled' 
      : 'pending';

    const approvalFlow = [
      {
        level: 1,
        approverId: 'manager-1',
        approverName: '部门主管',
        status: approvalStatus === 'pending' ? 'pending' as const : 
               approvalStatus === 'approved' ? 'approved' as const : 'rejected' as const,
        approveTime: approvalStatus !== 'pending' ? new Date().toISOString() : undefined
      },
      {
        level: 2,
        approverId: 'finance-1',
        approverName: '财务审核',
        status: approvalStatus === 'pending' ? 'pending' as const :
               approvalStatus === 'approved' && totalAmount > 5000 ? 'approved' as const : 'pending' as const,
        approveTime: approvalStatus === 'approved' && totalAmount > 5000 ? new Date().toISOString() : undefined
      }
    ];

    if (totalAmount > 5000) {
      approvalFlow.push({
        level: 3,
        approverId: 'ceo-1',
        approverName: '总经理',
        status: approvalStatus === 'pending' ? 'pending' as const :
               approvalStatus === 'approved' ? 'approved' as const : 'pending' as const,
        approveTime: approvalStatus === 'approved' ? new Date().toISOString() : undefined
      });
    }

    await storage.createReimbursement({
      reimbursementNo: `REIM-${dayjs().subtract(Math.floor(Math.random() * 90), 'day').format('YYYYMMDD')}-${String(i + 1).padStart(4, '0')}`,
      applicantId: applicant.id,
      applicantName: applicant.name,
      department: applicant.department || '未分配部门',
      expenseType,
      description: `${expenseType === 'travel' ? '差旅费' : expenseType === 'meals' ? '餐费' : expenseType === 'office' ? '办公费' : '其他费用'}报销`,
      invoices: selectedInvoices,
      totalAmount,
      budgetCheckStatus,
      approvalStatus,
      approvalFlow,
      currentApprover: approvalFlow.find(n => n.status === 'pending')?.approverId,
      paymentStatus,
      paymentTime: paymentStatus === 'paid' ? new Date().toISOString() : undefined
    });
  }

  console.log('报销数据生成完成');
}

async function generateSalesInvoices() {
  console.log('生成销售发票数据...');
  const companies = await storage.findAllCompanies();
  const users = await storage.findAllUsers();
  
  if (companies.length === 0 || users.length === 0) {
    console.log('请先生成企业和用户数据');
    return;
  }

  for (let i = 0; i < 200; i++) {
    const customer = companies[Math.floor(Math.random() * companies.length)];
    const issuedBy = users[Math.floor(Math.random() * users.length)].id;
    const invoiceCode = generateInvoiceCode();
    const invoiceNo = generateInvoiceNo();
    const amount = Math.floor(Math.random() * 800000) + 10000;
    const taxRate = [0.03, 0.06, 0.09, 0.13][Math.floor(Math.random() * 4)];
    const taxAmount = Math.round(amount * taxRate * 100) / 100;
    const totalAmount = amount + taxAmount;
    const issueDate = generateDate(Math.floor(Math.random() * 90));
    
    const statuses: Array<'issued' | 'cancelled' | 'red_voided'> = 
      ['issued', 'cancelled', 'red_voided'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    await storage.createSalesInvoice({
      invoiceCode,
      invoiceNo,
      invoiceType: 'electronic',
      issueDate,
      customerId: customer.id,
      customerName: customer.name,
      customerTaxNo: customer.taxNumber,
      amount,
      taxRate,
      taxAmount,
      totalAmount,
      status,
      issuedBy,
      blockchainTxHash: generateBlockchainTxHash()
    });
  }

  console.log('销售发票数据生成完成');
}

async function main() {
  console.log('开始生成模拟数据...\n');
  
  await generateUsers();
  await generateCompanies();
  await generateInvoices();
  await generatePurchaseOrders();
  await generateReceipts();
  await generateReimbursements();
  await generateSalesInvoices();
  
  console.log('\n所有数据生成完成！');
  process.exit(0);
}

main().catch(console.error);

