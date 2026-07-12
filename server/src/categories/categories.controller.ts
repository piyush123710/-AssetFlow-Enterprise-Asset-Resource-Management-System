import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: { select: { assets: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await prisma.assetCategory.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const category = await prisma.assetCategory.create({
      data: { name, description }
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.userId,
        action: 'CREATED_CATEGORY',
        details: JSON.stringify({ categoryId: category.id, name })
      }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
