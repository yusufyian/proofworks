import bcrypt from 'bcryptjs';
import { storage } from '../storage/fileStorage';

async function testLogin() {
  const testEmail = 'support.inspector0@ecotech.com';
  const testPassword = '123456';

  console.log(`测试登录: ${testEmail}`);
  
  const user = await storage.findUser({ email: testEmail });
  if (!user) {
    console.error('用户不存在！');
    return;
  }

  console.log(`找到用户:`, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  console.log(`存储的密码哈希: ${user.password.substring(0, 30)}...`);
  
  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log(`密码验证结果: ${isValid}`);
  
  if (isValid) {
    console.log('✅ 密码验证成功！');
  } else {
    console.log('❌ 密码验证失败！');
    
    // 尝试生成新的密码哈希
    console.log('\n正在生成新的密码哈希...');
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log(`新的密码哈希: ${newHash}`);
  }
}

testLogin().catch(console.error);
