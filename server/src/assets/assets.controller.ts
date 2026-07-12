import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import QRCode from 'qrcode';

export const registerAsset = async (req: Request, res: Response): Promise<any> => {
  try {
    const { 
      name, categoryId, serialNumber, purchaseDate, 
      cost, condition, location, isShared, photoUrl 
    } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ message: 'Name and Category are required' });
    }

    // Auto-generate sequential Asset Tag (e.g., AF-0001)
    // We can find the count of assets and add 1, or find the last assetTag and increment
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { assetTag: true }
    });

    let nextNum = 1;
    if (lastAsset && lastAsset.assetTag && lastAsset.assetTag.startsWith('AF-')) {
      const numStr = lastAsset.assetTag.replace('AF-', '');
      const parsedNum = parseInt(numStr, 10);
      if (!isNaN(parsedNum)) {
        nextNum = parsedNum + 1;
      }
    }
    
    const assetTag = `AF-${nextNum.toString().padStart(4, '0')}`;

    // Generate QR Code base64
    const qrCodeDataUrl = await QRCode.toDataURL(assetTag);

    const newAsset = await prisma.asset.create({
      data: {
        assetTag,
        name,
        categoryId,
        serialNumber: serialNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        cost: cost ? parseFloat(cost) : null,
        condition: condition || null,
        location: location || null,
        isShared: isShared || false,
        photoUrl: photoUrl || null,
        qrCodeUrl: qrCodeDataUrl,
        status: 'AVAILABLE'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: (req as any).user.userId,
        action: 'REGISTERED_ASSET',
        details: JSON.stringify({ assetId: newAsset.id, assetTag: newAsset.assetTag })
      }
    });

    return res.status(201).json(newAsset);
  } catch (error: any) {
    console.error('Error registering asset:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Serial number or Asset Tag already exists' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAssets = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 10, search, categoryId, status } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { assetTag: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (status) {
      where.status = status;
    }

    const [assets, totalItems] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take: limitNumber,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.asset.count({ where })
    ]);

    return res.status(200).json({
      data: assets,
      meta: {
        totalItems,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / limitNumber),
        itemsPerPage: limitNumber
      }
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        allocations: {
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        },
        maintenanceHist: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }

    return res.status(200).json(asset);
  } catch (error) {
    console.error('Error fetching asset details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
