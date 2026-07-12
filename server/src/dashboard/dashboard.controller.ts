import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalAssets = await prisma.asset.count();
    const allocatedAssets = await prisma.asset.count({ where: { status: 'ALLOCATED' } });
    const availableAssets = await prisma.asset.count({ where: { status: 'AVAILABLE' } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const maintenanceToday = await prisma.maintenanceRequest.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const pendingTransfers = await prisma.transferRequest.count({ where: { status: 'PENDING' } });

    // Upcoming returns (e.g. allocated assets that have a return date set, assuming we track expected return)
    // For now, mock this as 0 since expectedReturnDate is not in schema explicitly for allocations
    const upcomingReturns = 0;

    return res.status(200).json({
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceToday,
      pendingBookings,
      pendingTransfers,
      upcomingReturns
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCharts = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Assets by Category
    const categories = await prisma.assetCategory.findMany({
      include: {
        _count: {
          select: { assets: true }
        }
      }
    });
    const assetsByCategory = categories.map(cat => ({
      name: cat.name,
      value: cat._count.assets
    }));

    // 2. Department Assets
    const departments = await prisma.department.findMany({
      include: {
        users: {
          include: {
            allocations: true
          }
        }
      }
    });
    
    const departmentAssets = departments.map(dept => {
      const assetCount = dept.users.reduce((acc, user) => acc + user.allocations.length, 0);
      return {
        name: dept.name,
        assets: assetCount
      };
    });

    // 3. Maintenance Graph (Mock data for the last 6 months since we just created the DB)
    const maintenanceGraph = [
      { name: 'Jan', requests: 4 },
      { name: 'Feb', requests: 7 },
      { name: 'Mar', requests: 2 },
      { name: 'Apr', requests: 5 },
      { name: 'May', requests: 8 },
      { name: 'Jun', requests: 3 },
    ];

    return res.status(200).json({
      assetsByCategory: assetsByCategory.length ? assetsByCategory : [{ name: 'IT Equipment', value: 10 }, { name: 'Furniture', value: 5 }, { name: 'Vehicles', value: 2 }],
      departmentAssets: departmentAssets.length ? departmentAssets : [{ name: 'HR', assets: 4 }, { name: 'Engineering', assets: 12 }, { name: 'Sales', assets: 6 }],
      maintenanceGraph
    });
  } catch (error) {
    console.error('Error fetching dashboard charts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
