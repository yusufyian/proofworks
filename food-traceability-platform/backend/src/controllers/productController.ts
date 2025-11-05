import { Request, Response } from 'express';
import { FileStorage } from '../storage/fileStorage';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Product } from '../types';

export const getProducts = (req: Request, res: Response) => {
  try {
    const { category, brand, search } = req.query;
    let products = FileStorage.getProducts();
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (brand) {
      products = products.filter(p => p.brand === brand);
    }
    
    if (search) {
      const searchStr = (search as string).toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchStr) ||
        p.brand.toLowerCase().includes(searchStr)
      );
    }
    
    res.json({ success: true, data: products, total: products.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProduct = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = FileStorage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ success: false, error: '产品不存在' });
    }
    
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProduct = (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      category,
      specification,
      manufacturer,
      origin,
    } = req.body;

    // 验证必填字段
    if (!name || !brand || !category || !manufacturer?.name || !manufacturer?.creditCode || 
        !origin?.province || !origin?.city) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少必填字段：产品名称、品牌、类别、企业名称、统一社会信用代码、省份、城市' 
      });
    }

    // 如果没有GPS坐标，使用默认值（可以根据省份城市自动获取）
    const gps: [number, number] = origin.gps && origin.gps.length === 2 
      ? origin.gps 
      : [0, 0]; // 默认坐标，实际应用中应该根据地址解析

    const newProduct: Product = {
      id: uuidv4(),
      name,
      brand,
      category,
      specification: specification || '',
      manufacturer: {
        name: manufacturer.name,
        creditCode: manufacturer.creditCode,
        license: manufacturer.license || '',
        address: manufacturer.address || '',
      },
      origin: {
        province: origin.province,
        city: origin.city,
        district: origin.district || '',
        gps,
        certifications: origin.certifications || [],
      },
      createdAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      updatedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    // 保存产品
    FileStorage.saveProduct(newProduct);

    res.json({ success: true, data: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

