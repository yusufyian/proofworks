import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

// 英文名字库（用于生成邮箱，使用通用常见名字，避免与真实人物混淆）
const ENGLISH_NAMES = [
  'user', 'admin', 'manager', 'staff', 'person', 'member', 'contact', 'support',
  'test', 'demo', 'sample', 'example', 'account', 'client', 'customer', 'operator',
  'agent', 'assistant', 'coordinator', 'executive', 'director', 'officer', 'representative', 'specialist',
  'analyst', 'consultant', 'engineer', 'technician', 'associate', 'partner', 'supervisor', 'coordinator',
  'handler', 'processor', 'validator', 'reviewer', 'auditor', 'inspector', 'examiner', 'evaluator',
  'monitor', 'tracker', 'reporter', 'recorder', 'archivist', 'librarian', 'curator', 'cataloger'
];

const DOMAINS = ['carbon-esg.com', 'green-energy.cn', 'ecotech.com'];

// 检测是否需要修复（包含中文、特殊字符，或者是旧的人名格式）
function needsFix(email: string): boolean {
  // 检测中文字符
  const chineseRegex = /[\u4e00-\u9fa5]/;
  // 检测特殊字符（除了 @ . - _ 之外的）
  const specialCharRegex = /[^a-zA-Z0-9@.\-_]/;
  
  // 旧的人名列表（需要替换）
  const oldNames = ['alice', 'bob', 'charlie', 'david', 'emma', 'frank', 'grace', 'henry',
    'ivy', 'jack', 'kate', 'liam', 'mia', 'noah', 'olivia', 'peter',
    'quinn', 'rose', 'sam', 'tina', 'will', 'zoe', 'adam', 'bella',
    'chris', 'diana', 'ethan', 'fiona', 'george', 'helen', 'ian', 'jenny',
    'kevin', 'lisa', 'mike', 'nancy', 'oscar', 'patty', 'ryan', 'sarah',
    'thomas', 'una', 'victor', 'wendy', 'xavier', 'yuki', 'zara', 'alex',
    'ben', 'cathy', 'dan', 'ellen', 'fred', 'gina', 'hugo', 'iris'];
  
  // 检查是否包含中文或特殊字符
  if (chineseRegex.test(email) || specialCharRegex.test(email)) {
    return true;
  }
  
  // 检查是否包含旧的人名
  const emailLower = email.toLowerCase();
  for (const oldName of oldNames) {
    if (emailLower.includes(oldName)) {
      return true;
    }
  }
  
  return false;
}

// 生成新的邮箱
function generateNewEmail(index: number): string {
  const firstName = ENGLISH_NAMES[index % ENGLISH_NAMES.length];
  const lastName = ENGLISH_NAMES[(index * 7) % ENGLISH_NAMES.length]; // 使用不同的算法确保变化
  const domain = DOMAINS[index % DOMAINS.length];
  const number = Math.floor(index / ENGLISH_NAMES.length) + index;
  return `${firstName}.${lastName}${number}@${domain}`;
}

async function fixEmails() {
  console.log('开始修复邮箱地址...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('数据文件不存在:', DATA_FILE);
    return;
  }

  // 读取数据
  const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(dataContent);

  let fixedCount = 0;
  let emailIndex = 0;

  // 修复用户的邮箱
  if (data.users && Array.isArray(data.users)) {
    console.log(`检查 ${data.users.length} 个用户的邮箱...`);
    for (const user of data.users) {
      if (user.email && needsFix(user.email)) {
        const oldEmail = user.email;
        user.email = generateNewEmail(emailIndex++);
        fixedCount++;
        console.log(`修复用户邮箱: ${oldEmail} -> ${user.email}`);
      }
    }
  }

  // 修复公司的联系邮箱
  if (data.companies && Array.isArray(data.companies)) {
    console.log(`检查 ${data.companies.length} 个公司的联系邮箱...`);
    for (const company of data.companies) {
      if (company.contactEmail && needsFix(company.contactEmail)) {
        const oldEmail = company.contactEmail;
        company.contactEmail = generateNewEmail(emailIndex++);
        fixedCount++;
        console.log(`修复公司联系邮箱: ${oldEmail} -> ${company.contactEmail} (公司: ${company.name})`);
      }
    }
  }

  // 保存修复后的数据
  if (fixedCount > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n修复完成！共修复 ${fixedCount} 个邮箱地址。`);
  } else {
    console.log('\n没有发现需要修复的邮箱地址。');
  }
}

if (require.main === module) {
  fixEmails().catch(console.error);
}

export { fixEmails };
