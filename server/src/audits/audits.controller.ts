import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createAuditCycle = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, startDate, endDate, description } = req.body;
    const createdBy = (req as any).user.userId;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, Start Date, and End Date are required' });
    }

    const auditCycle = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        status: 'IN_PROGRESS',
        createdBy
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: createdBy,
        action: 'CREATED_AUDIT_CYCLE',
        details: JSON.stringify({ auditId: auditCycle.id, name })
      }
    });

    return res.status(201).json(auditCycle);
  } catch (error) {
    console.error('Error creating audit cycle:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditCycles = async (req: Request, res: Response): Promise<any> => {
  try {
    const audits = await prisma.auditCycle.findMany({
      include: {
        creator: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(audits);
  } catch (error) {
    console.error('Error fetching audit cycles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditCycleById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    
    const audit = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        items: {
          include: {
            asset: { select: { id: true, name: true, assetTag: true, status: true, location: true } }
          }
        }
      }
    });

    if (!audit) {
      return res.status(404).json({ message: 'Audit cycle not found' });
    }

    return res.status(200).json(audit);
  } catch (error) {
    console.error('Error fetching audit cycle details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addAssetToAudit = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // audit cycle id
    const { assetId } = req.body;

    if (!assetId) {
      return res.status(400).json({ message: 'Asset ID is required' });
    }

    const audit = await prisma.auditCycle.findUnique({ where: { id } });
    if (!audit || audit.status !== 'IN_PROGRESS') {
      return res.status(400).json({ message: 'Audit cycle is not active' });
    }

    // Check if already added
    const existing = await prisma.auditItem.findFirst({
      where: { auditId: id, assetId }
    });

    if (existing) {
      return res.status(400).json({ message: 'Asset is already in this audit cycle' });
    }

    const item = await prisma.auditItem.create({
      data: {
        auditId: id,
        assetId,
        status: 'PENDING'
      },
      include: {
        asset: { select: { name: true, assetTag: true, status: true, location: true } }
      }
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error('Error adding asset to audit:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAuditItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { itemId } = req.params;
    const { status, notes } = req.body; // 'FOUND', 'MISSING', 'DAMAGED'
    const auditorId = (req as any).user.userId;

    if (!['FOUND', 'MISSING', 'DAMAGED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid audit status' });
    }

    const updated = await prisma.auditItem.update({
      where: { id: itemId },
      data: {
        status,
        notes,
        auditedAt: new Date()
      }
    });

    // We could update the asset status to MISSING or DAMAGED automatically if we had those statuses,
    // but for now we'll just log it in the audit.
    // If DAMAGED, maybe we auto-create a maintenance request? That's an advanced feature.
    
    await prisma.activityLog.create({
      data: {
        userId: auditorId,
        action: 'AUDITED_ASSET',
        details: JSON.stringify({ itemId, status, notes })
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating audit item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
