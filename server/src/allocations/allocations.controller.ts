import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Allocate an asset to a user
export const allocateAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId, userId } = req.body;

    if (!assetId || !userId) {
      return res.status(400).json({ message: 'Asset ID and User ID are required' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    if (asset.status !== 'AVAILABLE') {
      return res.status(400).json({ message: 'Asset is not available for allocation' });
    }

    // Use a transaction to create the allocation and update the asset status
    const allocation = await prisma.$transaction(async (tx) => {
      const newAlloc = await tx.assetAllocation.create({
        data: {
          assetId,
          userId,
        }
      });

      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'ALLOCATED' }
      });

      await tx.activityLog.create({
        data: {
          userId: (req as any).user.userId,
          action: 'ALLOCATED_ASSET',
          details: JSON.stringify({ assetId, assignedTo: userId })
        }
      });

      return newAlloc;
    });

    return res.status(201).json(allocation);
  } catch (error) {
    console.error('Error allocating asset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all allocations for the current user (My Assets)
export const getMyAssets = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    
    const allocations = await prisma.assetAllocation.findMany({
      where: { 
        userId, 
        returnDate: null // Only get currently allocated assets
      },
      include: {
        asset: {
          include: { category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(allocations);
  } catch (error) {
    console.error('Error fetching my assets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Return an asset
export const returnAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // allocation id
    const userId = (req as any).user.userId;

    const allocation = await prisma.assetAllocation.findUnique({ where: { id } });
    
    if (!allocation) {
      return res.status(404).json({ message: 'Allocation not found' });
    }

    if (allocation.returnDate) {
      return res.status(400).json({ message: 'Asset already returned' });
    }

    // To be safe, ensure the person returning it is the owner or an admin
    if (allocation.userId !== userId && (req as any).user.role !== 'ADMIN' && (req as any).user.role !== 'ASSET_MANAGER') {
       return res.status(403).json({ message: 'Not authorized to return this asset' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.assetAllocation.update({
        where: { id },
        data: { returnDate: new Date() }
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: { status: 'AVAILABLE' }
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: 'RETURNED_ASSET',
          details: JSON.stringify({ assetId: allocation.assetId, allocationId: id })
        }
      });
    });

    return res.status(200).json({ message: 'Asset returned successfully' });
  } catch (error) {
    console.error('Error returning asset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
