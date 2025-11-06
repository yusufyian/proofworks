import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { storage } from '../storage/fileStorage';
import { mockBlockchainCertify } from '../utils/blockchain';
import type { CarbonInventory, ProductCarbonFootprint, ReductionProject, ESGReport } from '../types';

export async function certifyToBlockchain(req: AuthRequest, res: Response) {
  try {
    const { resourceType, resourceId } = req.body;

    if (!resourceType || !resourceId) {
      return res.status(400).json({ error: '资源类型和资源ID不能为空' });
    }

    let resource: any = null;
    let certifyData: any = null;

    switch (resourceType) {
      case 'inventory': {
        const inventory = await storage.findCarbonInventory(resourceId);
        if (!inventory) {
          return res.status(404).json({ error: '碳盘查记录不存在' });
        }
        if (req.user && inventory.companyId !== req.user.companyId) {
          return res.status(403).json({ error: '无权访问' });
        }
        resource = inventory;
        certifyData = {
          type: 'carbon_inventory',
          id: inventory.id,
          companyId: inventory.companyId,
          period: inventory.period,
          scope1Emissions: inventory.scope1Emissions,
          scope2Emissions: inventory.scope2Emissions,
          scope3Emissions: inventory.scope3Emissions,
          totalEmissions: inventory.totalEmissions,
          certificationNumber: inventory.certificationNumber,
          timestamp: new Date().toISOString(),
        };
        break;
      }
      case 'product': {
        const product = await storage.findProductCarbonFootprint(resourceId);
        if (!product) {
          return res.status(404).json({ error: '产品碳足迹不存在' });
        }
        if (req.user && product.companyId !== req.user.companyId) {
          return res.status(403).json({ error: '无权访问' });
        }
        resource = product;
        certifyData = {
          type: 'product_carbon_footprint',
          id: product.id,
          companyId: product.companyId,
          productId: product.productId,
          productName: product.productName,
          lcaResult: product.lcaResult,
          carbonLabel: product.carbonLabel,
          timestamp: new Date().toISOString(),
        };
        break;
      }
      case 'reduction_project': {
        const project = await storage.findReductionProject(resourceId);
        if (!project) {
          return res.status(404).json({ error: '减排项目不存在' });
        }
        if (req.user && project.companyId !== req.user.companyId) {
          return res.status(403).json({ error: '无权访问' });
        }
        resource = project;
        certifyData = {
          type: 'reduction_project',
          id: project.id,
          companyId: project.companyId,
          projectName: project.projectName,
          projectType: project.projectType,
          reductionAmount: project.reductionAmount,
          vintage: project.vintage,
          certificationNumber: project.certificationNumber,
          timestamp: new Date().toISOString(),
        };
        break;
      }
      case 'esg_report': {
        const report = await storage.findESGReport(resourceId);
        if (!report) {
          return res.status(404).json({ error: 'ESG报告不存在' });
        }
        if (req.user && report.companyId !== req.user.companyId) {
          return res.status(403).json({ error: '无权访问' });
        }
        resource = report;
        certifyData = {
          type: 'esg_report',
          id: report.id,
          companyId: report.companyId,
          year: report.year,
          standard: report.standard,
          timestamp: new Date().toISOString(),
        };
        break;
      }
      default:
        return res.status(400).json({ error: '无效的资源类型' });
    }

    // 如果已经有区块链哈希，返回已有信息
    if (resource.blockchainHash) {
      return res.json({
        data: {
          hash: resource.blockchainHash,
          alreadyCertified: true,
          message: '该记录已上链存证',
        },
      });
    }

    // 执行区块链存证
    const blockchainResult = mockBlockchainCertify(certifyData);

    // 更新资源记录
    let updated: any;
    switch (resourceType) {
      case 'inventory':
        updated = await storage.updateCarbonInventory(resourceId, {
          blockchainHash: blockchainResult.transactionHash,
        });
        break;
      case 'product':
        updated = await storage.updateProductCarbonFootprint(resourceId, {
          blockchainHash: blockchainResult.transactionHash,
        });
        break;
      case 'reduction_project':
        updated = await storage.updateReductionProject(resourceId, {
          blockchainTokenId: blockchainResult.transactionHash,
        });
        break;
      case 'esg_report':
        updated = await storage.updateESGReport(resourceId, {
          blockchainHash: blockchainResult.transactionHash,
        });
        break;
    }

    res.json({
      data: {
        ...blockchainResult,
        resourceId,
        resourceType,
        updated,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBlockchainRecords(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未授权' });
    }

    const companyId = req.user.companyId;

    // 获取所有已上链的记录
    const inventories = await storage.findCarbonInventories({ companyId });
    const products = await storage.findProductCarbonFootprints({ companyId });
    const projects = await storage.findReductionProjects({ companyId });
    const reports = await storage.findESGReports({ companyId });

    const records = [
      ...inventories
        .filter((inv: any) => inv.blockchainHash)
        .map((inv: any) => ({
          id: inv.id,
          resourceType: 'inventory' as const,
          resourceTypeName: '组织碳盘查',
          title: `${inv.period} 碳盘查报告`,
          hash: inv.blockchainHash,
          certificationNumber: inv.certificationNumber,
          createdAt: inv.createdAt,
        })),
      ...products
        .filter((p: any) => p.blockchainHash)
        .map((p: any) => ({
          id: p.id,
          resourceType: 'product' as const,
          resourceTypeName: '产品碳足迹',
          title: `${p.productName} - ${p.lcaResult} kgCO2e`,
          hash: p.blockchainHash,
          certificationNumber: p.verified ? '已核证' : undefined,
          createdAt: p.createdAt,
        })),
      ...projects
        .filter((p: any) => p.blockchainTokenId || p.certificationNumber)
        .map((p: any) => ({
          id: p.id,
          resourceType: 'reduction_project' as const,
          resourceTypeName: '减排项目',
          title: `${p.projectName} - ${p.reductionAmount} tCO2e`,
          hash: p.blockchainTokenId || p.blockchainHash,
          certificationNumber: p.certificationNumber,
          createdAt: p.createdAt,
        })),
      ...reports
        .filter((r: any) => r.blockchainHash)
        .map((r: any) => ({
          id: r.id,
          resourceType: 'esg_report' as const,
          resourceTypeName: 'ESG报告',
          title: `${r.year}年度 ESG报告 (${r.standard})`,
          hash: r.blockchainHash,
          certificationNumber: undefined,
          createdAt: r.createdAt,
        })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
