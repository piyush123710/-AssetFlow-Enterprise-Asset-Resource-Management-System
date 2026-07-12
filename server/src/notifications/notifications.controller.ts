import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to latest 20
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    await prisma.notification.updateMany({
      where: { id, userId }, // Ensure user owns it
      data: { isRead: true }
    });

    return res.status(200).json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return res.status(200).json({ message: 'All marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
