import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAssetsReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        category: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedData = assets.map(a => ({
      AssetTag: a.assetTag,
      Name: a.name,
      Category: a.category?.name || 'Uncategorized',
      SerialNumber: a.serialNumber || '',
      PurchaseDate: a.purchaseDate ? a.purchaseDate.toISOString().split('T')[0] : '',
      PurchaseCost: a.purchaseCost || 0,
      Status: a.status,
      Location: a.location || ''
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error generating assets report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMaintenanceReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const maintenance = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { name: true, assetTag: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedData = maintenance.map(m => ({
      MaintenanceID: m.id,
      AssetTag: m.asset?.assetTag || '',
      AssetName: m.asset?.name || '',
      Status: m.status,
      ReportedDate: m.createdAt.toISOString().split('T')[0],
      ResolvedDate: m.resolvedAt ? m.resolvedAt.toISOString().split('T')[0] : '',
      EstimatedCost: m.estimatedCost || 0,
      ActualCost: m.actualCost || 0,
      Issue: m.issueDescription
    }));

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error generating maintenance report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuditsReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const audits = await prisma.auditCycle.findMany({
      include: {
        items: {
          include: { asset: { select: { name: true, assetTag: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedData: any[] = [];
    audits.forEach(audit => {
      audit.items.forEach(item => {
        formattedData.push({
          AuditName: audit.name,
          AuditStatus: audit.status,
          AssetTag: item.asset?.assetTag || '',
          AssetName: item.asset?.name || '',
          ItemStatus: item.status,
          AuditedAt: item.auditedAt ? item.auditedAt.toISOString().split('T')[0] : 'Pending',
          Notes: item.notes || ''
        });
      });
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error('Error generating audits report:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
