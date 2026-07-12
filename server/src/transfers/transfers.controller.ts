import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const requestTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId, toUserId, reason } = req.body;
    const fromUserId = (req as any).user.userId;

    if (!assetId || !toUserId) {
      return res.status(400).json({ message: 'Asset ID and Target User ID are required' });
    }

    // Ensure the asset is currently allocated to the user requesting the transfer
    const currentAllocation = await prisma.assetAllocation.findFirst({
      where: {
        assetId,
        userId: fromUserId,
        returnedAt: null
      }
    });

    if (!currentAllocation) {
      return res.status(400).json({ message: 'You do not have this asset currently allocated' });
    }

    const transferReq = await prisma.transferRequest.create({
      data: {
        assetId,
        fromUserId,
        toUserId,
        status: 'PENDING'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: fromUserId,
        action: 'REQUESTED_TRANSFER',
        details: JSON.stringify({ transferId: transferReq.id, assetId, toUserId })
      }
    });

    return res.status(201).json(transferReq);
  } catch (error) {
    console.error('Error requesting transfer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTransfers = async (req: Request, res: Response): Promise<any> => {
  try {
    const transfers = await prisma.transferRequest.findMany({
      include: {
        asset: { select: { name: true, assetTag: true } },
        fromUser: { select: { name: true, email: true } },
        toUser: { select: { name: true, email: true } }
      },
      orderBy: { requestedAt: 'desc' }
    });

    return res.status(200).json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const respondToTransfer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // 'APPROVED' or 'REJECTED'
    const approverId = (req as any).user.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const transfer = await prisma.transferRequest.findUnique({ where: { id } });
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer request not found' });
    }

    if (transfer.status !== 'PENDING') {
      return res.status(400).json({ message: 'Transfer request is already processed' });
    }

    await prisma.$transaction(async (tx) => {
      // Update transfer status
      await tx.transferRequest.update({
        where: { id },
        data: {
          status,
          resolvedAt: new Date()
        }
      });

      if (status === 'APPROVED') {
        // End the current allocation for fromUser
        const currentAlloc = await tx.assetAllocation.findFirst({
          where: { assetId: transfer.assetId, userId: transfer.fromUserId, returnedAt: null }
        });
        
        if (currentAlloc) {
          await tx.assetAllocation.update({
            where: { id: currentAlloc.id },
            data: { returnedAt: new Date() }
          });
        }

        // Create new allocation for toUser
        await tx.assetAllocation.create({
          data: {
            assetId: transfer.assetId,
            userId: transfer.toUserId
          }
        });
      }

      await tx.activityLog.create({
        data: {
          userId: approverId,
          action: status === 'APPROVED' ? 'APPROVED_TRANSFER' : 'REJECTED_TRANSFER',
          details: JSON.stringify({ transferId: id, remarks })
        }
      });
    });

    return res.status(200).json({ message: `Transfer ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Error responding to transfer:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
