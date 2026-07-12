import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getActivityLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    // Optional filter by action type
    const action = req.query.action as string;
    
    const whereClause: any = {};
    if (action) {
      whereClause.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.activityLog.count({ where: whereClause })
    ]);

    return res.status(200).json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
