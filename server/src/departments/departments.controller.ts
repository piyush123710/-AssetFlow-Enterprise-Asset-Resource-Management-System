import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDepartments = async (req: Request, res: Response): Promise<any> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        head: { select: { id: true, name: true, email: true } },
        _count: { select: { users: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, headId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Department already exists' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        headId: headId || null
      },
      include: {
        head: { select: { id: true, name: true } }
      }
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.userId,
        action: 'CREATED_DEPARTMENT',
        details: JSON.stringify({ departmentId: department.id, name })
      }
    });

    return res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, headId } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        headId: headId || null
      },
      include: {
        head: { select: { id: true, name: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.userId,
        action: 'UPDATED_DEPARTMENT',
        details: JSON.stringify({ departmentId: id, name, headId })
      }
    });

    return res.status(200).json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
