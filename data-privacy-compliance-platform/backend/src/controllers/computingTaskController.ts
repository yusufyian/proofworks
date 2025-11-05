import { Request, Response, NextFunction } from 'express';
import { getStorage, updateStorage } from '../storage/fileStorage';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { ComputingTask, ComputingMethod, TaskStatus } from '../types';

export const getComputingTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const storage = getStorage();
    const userId = req.user?.id;
    const { page = 1, limit = 20, status, method } = req.query;

    let tasks = storage.computingTasks;

    // 根据角色过滤
    if (req.user?.role !== 'admin') {
      tasks = tasks.filter(t => 
        t.initiator === userId || t.participants.includes(userId!)
      );
    }

    // 状态过滤
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    // 方法过滤
    if (method) {
      tasks = tasks.filter(t => t.method === method);
    }

    // 分页
    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = tasks.slice(start, end);

    // 填充关联数据
    const enriched = paginated.map(task => {
      const initiator = storage.users.find(u => u.id === task.initiator);
      const participants = task.participants.map(pId => {
        const user = storage.users.find(u => u.id === pId);
        return { id: pId, name: user?.name, organization: user?.organization };
      });
      return {
        ...task,
        initiatorName: initiator?.name,
        initiatorOrg: initiator?.organization,
        participantsInfo: participants,
      };
    });

    res.json({
      success: true,
      data: {
        items: enriched,
        total: tasks.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(tasks.length / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createComputingTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, method, authorizationIds, participants } = req.body;
    const userId = req.user?.id;

    if (!name || !method || !authorizationIds || !participants) {
      throw new AppError('缺少必填字段', 400);
    }

    const storage = getStorage();
    
    // 验证授权
    const authorizations = storage.authorizations.filter(a => authorizationIds.includes(a.id));
    if (authorizations.length !== authorizationIds.length) {
      throw new AppError('部分授权记录不存在', 404);
    }

    const invalidAuths = authorizations.filter(a => 
      a.status !== 'approved' || a.grantee !== userId
    );
    if (invalidAuths.length > 0) {
      throw new AppError('部分授权记录无效', 400);
    }

    const newTask: ComputingTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      method: method as ComputingMethod,
      initiator: userId!,
      participants: Array.isArray(participants) ? participants : [participants],
      authorizationIds: Array.isArray(authorizationIds) ? authorizationIds : [authorizationIds],
      inputHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    updateStorage(storage => {
      storage.computingTasks.push(newTask);
      return storage;
    });

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['running', 'completed', 'failed', 'cancelled'].includes(status)) {
      throw new AppError('无效的状态', 400);
    }

    const storage = getStorage();
    const task = storage.computingTasks.find(t => t.id === id);
    if (!task) {
      throw new AppError('计算任务不存在', 404);
    }

    updateStorage(storage => {
      const index = storage.computingTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        const now = new Date().toISOString();
        storage.computingTasks[index] = {
          ...storage.computingTasks[index],
          status: status as TaskStatus,
          startedAt: status === 'running' && !storage.computingTasks[index].startedAt 
            ? now 
            : storage.computingTasks[index].startedAt,
          completedAt: ['completed', 'failed', 'cancelled'].includes(status) 
            ? now 
            : storage.computingTasks[index].completedAt,
          outputHash: status === 'completed' 
            ? `0x${Math.random().toString(16).substr(2, 64)}` 
            : storage.computingTasks[index].outputHash,
          blockchainHash: status === 'completed' 
            ? `0x${Math.random().toString(16).substr(2, 64)}` 
            : storage.computingTasks[index].blockchainHash,
          result: status === 'completed' 
            ? { score: Math.floor(Math.random() * 100), count: Math.floor(Math.random() * 10000) }
            : storage.computingTasks[index].result,
        };
      }
      return storage;
    });

    res.json({
      success: true,
      data: storage.computingTasks.find(t => t.id === id),
    });
  } catch (error) {
    next(error);
  }
};

