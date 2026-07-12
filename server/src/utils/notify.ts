import { prisma } from '../lib/prisma';

export const createNotification = async (userId: string, message: string, type: string = 'SYSTEM') => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        message,
        type,
        isRead: false
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
