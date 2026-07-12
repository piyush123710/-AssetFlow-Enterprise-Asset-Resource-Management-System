import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const reportIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId, issueDescription, estimatedCost } = req.body;
    const reportedBy = (req as any).user.userId;

    if (!assetId || !issueDescription) {
      return res.status(400).json({ message: 'Asset ID and issue description are required' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    // Admins can report issues on any asset, employees should probably only report on allocated/shared, but for now we allow anyone to report issues if they see a broken asset.

    const maintenance = await prisma.$transaction(async (tx) => {
      // 1. Create maintenance request
      const req = await tx.maintenanceRequest.create({
        data: {
          assetId,
          userId: reportedBy,
          issueDetails: issueDescription,
          status: 'PENDING'
        }
      });

      // 2. Change asset status to MAINTENANCE
      await tx.asset.update({
        where: { id: assetId },
        data: { status: 'MAINTENANCE' }
      });

      // 3. Log activity
      await tx.activityLog.create({
        data: {
          userId: reportedBy,
          action: 'REPORTED_ISSUE',
          details: JSON.stringify({ maintenanceId: req.id, assetId })
        }
      });

      return req;
    });

    return res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error reporting issue:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMaintenanceQueue = async (req: Request, res: Response): Promise<any> => {
  try {
    const queue = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { name: true, assetTag: true, status: true } },
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(queue);
  } catch (error) {
    console.error('Error fetching maintenance queue:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const resolveIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { resolutionNotes, actualCost } = req.body;
    const resolverId = (req as any).user.userId;

    const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    if (maintenance.status !== 'PENDING' && maintenance.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Maintenance request is already resolved' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update maintenance record
      await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          history: resolutionNotes,
          technicianId: resolverId
        }
      });

      // 2. Update asset status back to AVAILABLE and update last maintenance date
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: { 
          status: 'AVAILABLE'
        }
      });

      // 3. Log activity
      await tx.activityLog.create({
        data: {
          userId: resolverId,
          action: 'RESOLVED_ISSUE',
          details: JSON.stringify({ maintenanceId: id, assetId: maintenance.assetId })
        }
      });
    });

    return res.status(200).json({ message: 'Maintenance issue resolved' });
  } catch (error) {
    console.error('Error resolving issue:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
