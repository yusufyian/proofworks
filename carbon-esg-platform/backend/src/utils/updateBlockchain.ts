import fs from 'fs';
import path from 'path';
import { mockBlockchainCertify } from './blockchain';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'storage.json');

async function updateExistingDataWithBlockchain() {
  console.log('开始为已有数据添加区块链哈希...');

  if (!fs.existsSync(DATA_FILE)) {
    console.error('数据文件不存在:', DATA_FILE);
    return;
  }

  const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(dataContent);

  let updatedCount = 0;

  // 更新碳盘查记录
  if (data.carbonInventories) {
    for (const inventory of data.carbonInventories) {
      if ((inventory.status === 'certified' || inventory.status === 'verified') && !inventory.blockchainHash) {
        const blockchainData = mockBlockchainCertify(inventory);
        inventory.blockchainHash = blockchainData.transactionHash;
        updatedCount++;
        console.log(`更新碳盘查记录: ${inventory.period} - ${inventory.blockchainHash.substring(0, 20)}...`);
      }
    }
  }

  // 更新产品碳足迹
  if (data.productCarbonFootprints) {
    for (const product of data.productCarbonFootprints) {
      if (product.verified && !product.blockchainHash) {
        const blockchainData = mockBlockchainCertify(product);
        product.blockchainHash = blockchainData.transactionHash;
        updatedCount++;
        console.log(`更新产品碳足迹: ${product.productName} - ${product.blockchainHash.substring(0, 20)}...`);
      }
    }
  }

  // 更新减排项目
  if (data.reductionProjects) {
    for (const project of data.reductionProjects) {
      if ((project.status === 'certified' || project.status === 'trading') && !project.blockchainTokenId && !project.blockchainHash) {
        const blockchainData = mockBlockchainCertify(project);
        project.blockchainTokenId = blockchainData.transactionHash;
        updatedCount++;
        console.log(`更新减排项目: ${project.projectName} - ${project.blockchainTokenId.substring(0, 20)}...`);
      }
    }
  }

  // 更新ESG报告
  if (data.esgReports) {
    for (const report of data.esgReports) {
      if (report.status === 'published' && !report.blockchainHash) {
        const blockchainData = mockBlockchainCertify(report);
        report.blockchainHash = blockchainData.transactionHash;
        updatedCount++;
        console.log(`更新ESG报告: ${report.year}年度 - ${report.blockchainHash.substring(0, 20)}...`);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n更新完成！共为 ${updatedCount} 条记录添加了区块链哈希。`);
  } else {
    console.log('\n没有需要更新的记录。');
  }
}

if (require.main === module) {
  updateExistingDataWithBlockchain().catch(console.error);
}

export { updateExistingDataWithBlockchain };
