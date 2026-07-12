import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assetId, startTime, endTime, purpose } = req.body;
    const userId = (req as any).user.userId;

    if (!assetId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Asset, start time, and end time are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    
    if (!asset || !asset.isShared) {
      return res.status(400).json({ message: 'Asset is not a shared resource' });
    }

    // Check for overlapping APPROVED or PENDING bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        assetId,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          {
            startTime: { lt: end },
            endTime: { gt: start }
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(409).json({ message: 'This resource is already booked or requested for this time slot' });
    }

    const booking = await prisma.booking.create({
      data: {
        assetId,
        userId,
        startTime: start,
        endTime: end,
        purpose,
        status: 'PENDING'
      }
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CREATED_BOOKING',
        details: JSON.stringify({ bookingId: booking.id, assetId, start, end })
      }
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMyBookings = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.userId;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { asset: { select: { name: true, assetTag: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<any> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        asset: { select: { name: true, assetTag: true } },
        user: { select: { name: true, email: true } },
        approvedBy: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const respondToBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    const approverId = (req as any).user.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Booking already processed' });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        approvedById: approverId
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: approverId,
        action: status === 'APPROVED' ? 'APPROVED_BOOKING' : 'REJECTED_BOOKING',
        details: JSON.stringify({ bookingId: id })
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error responding to booking:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSharedAssets = async (req: Request, res: Response): Promise<any> => {
  try {
    const sharedAssets = await prisma.asset.findMany({
      where: { isShared: true, status: 'AVAILABLE' },
      select: { id: true, name: true, assetTag: true }
    });
    return res.status(200).json(sharedAssets);
  } catch (error) {
    console.error('Error fetching shared assets:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
