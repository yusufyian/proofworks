import express, { Response } from 'express';
import fileStorage from '../storage/fileStorage';
import { getBlockchainInfo } from '../utils/blockchain';

export const blockchainController = {
  getInfo: async (req: express.Request, res: Response) => {
    try {
      const info = getBlockchainInfo();
      res.json({ data: info });
    } catch (error) {
      res.status(500).json({ error: '获取区块链信息失败' });
    }
  },

  verify: async (req: express.Request, res: Response) => {
    try {
      const { hash, type, id } = req.body;
      
      if (type === 'asset') {
        const assets = fileStorage.getAssets();
        const asset = assets.find(a => a.fileHash === hash || a.id === id);
        res.json({
          data: {
            verified: !!asset,
            result: asset ? {
              certificateId: asset.certificateId,
              timestamp: asset.timestamp.time,
              blockchain: asset.blockchain,
            } : null,
          },
        });
      } else if (type === 'infringement') {
        const infringements = fileStorage.getInfringements();
        const infringement = infringements.find(i => i.blockchain.evidenceHash === hash || i.id === id);
        res.json({
          data: {
            verified: !!infringement,
            result: infringement ? {
              evidenceHash: infringement.blockchain.evidenceHash,
              timestamp: infringement.createdAt,
              blockchain: infringement.blockchain,
            } : null,
          },
        });
      } else {
        res.status(400).json({ error: '不支持的验证类型' });
      }
    } catch (error) {
      res.status(500).json({ error: '验证失败' });
    }
  },

  getTransaction: async (req: express.Request, res: Response) => {
    try {
      const { txHash } = req.params;
      
      // 查找所有相关交易
      const assets = fileStorage.getAssets();
      const infringements = fileStorage.getInfringements();
      const licenses = fileStorage.getLicenses();
      
      const assetTx = assets.find(a => a.blockchain.txHash === txHash);
      const infringementTx = infringements.find(i => i.blockchain.txHash === txHash);
      const licenseTx = licenses.find(l => l.blockchain.txHash === txHash);
      
      const transaction = assetTx || infringementTx || licenseTx;
      
      if (!transaction) {
        return res.status(404).json({ error: '交易不存在' });
      }
      
      res.json({
        data: {
          txHash,
          blockHeight: transaction.blockchain?.blockHeight || 0,
          type: assetTx ? 'asset' : infringementTx ? 'infringement' : 'license',
          timestamp: assetTx?.createdAt || infringementTx?.createdAt || licenseTx?.createdAt,
          data: transaction,
        },
      });
    } catch (error) {
      res.status(500).json({ error: '获取交易信息失败' });
    }
  },
};

