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
