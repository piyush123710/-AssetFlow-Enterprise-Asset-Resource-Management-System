import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Role } from '@prisma/client';

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { role, departmentId } = req.body;

    if (role && !Object.values(Role).includes(role as Role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const dataToUpdate: any = {};
    if (role) dataToUpdate.role = role as Role;
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId || null;

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: { select: { id: true, name: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.userId,
        action: 'UPDATED_USER',
        details: JSON.stringify({ targetUserId: id, role, departmentId })
      }
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
