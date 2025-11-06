import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');
const DEFAULT_PASSWORD = '123456';

async function resetPasswords() {
  console.log('开始重置所有用户密码为 123456...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('数据文件不存在:', DATA_FILE);
    return;
  }

  // 读取数据
  const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(dataContent);

  let resetCount = 0;

  // 生成统一的密码哈希
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  console.log(`生成的密码哈希: ${hashedPassword.substring(0, 20)}...`);

  // 重置用户的密码
  if (data.users && Array.isArray(data.users)) {
    console.log(`检查 ${data.users.length} 个用户的密码...`);
    for (const user of data.users) {
      // 验证当前密码是否是 123456
      const isCurrentPassword = await bcrypt.compare(DEFAULT_PASSWORD, user.password);
      
      if (!isCurrentPassword) {
        user.password = hashedPassword;
        resetCount++;
        console.log(`重置用户密码: ${user.email}`);
      } else {
        console.log(`用户密码正确: ${user.email}`);
      }
    }
  }

  // 保存修复后的数据
  if (resetCount > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n重置完成！共重置 ${resetCount} 个用户的密码。`);
    console.log(`默认密码: ${DEFAULT_PASSWORD}`);
  } else {
    console.log('\n所有用户的密码都是正确的，无需重置。');
  }
}

if (require.main === module) {
  resetPasswords().catch(console.error);
}

export { resetPasswords };
