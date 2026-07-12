import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Departments
  const deptEng = await prisma.department.upsert({
    where: { name: 'Engineering' },
    update: {},
    create: { name: 'Engineering' }
  });
  const deptIT = await prisma.department.upsert({
    where: { name: 'IT' },
    update: {},
    create: { name: 'IT' }
  });
  const deptDesign = await prisma.department.upsert({
    where: { name: 'Design' },
    update: {},
    create: { name: 'Design' }
  });

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      email: 'admin@assetflow.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      departmentId: deptIT.id
    }
  });

  const emp1 = await prisma.user.upsert({
    where: { email: 'johndoe@assetflow.com' },
    update: {},
    create: {
      email: 'johndoe@assetflow.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: deptEng.id
    }
  });

  const emp2 = await prisma.user.upsert({
    where: { email: 'janedoe@assetflow.com' },
    update: {},
    create: {
      email: 'janedoe@assetflow.com',
      name: 'Jane Doe',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: deptDesign.id
    }
  });

  // 3. Create Categories
  const catLaptop = await prisma.assetCategory.upsert({
    where: { name: 'Laptops' },
    update: {},
    create: { name: 'Laptops', description: 'Company issued laptops' }
  });
  const catMonitor = await prisma.assetCategory.upsert({
    where: { name: 'Monitors' },
    update: {},
    create: { name: 'Monitors', description: 'External displays' }
  });
  const catVehicle = await prisma.assetCategory.upsert({
    where: { name: 'Vehicles' },
    update: {},
    create: { name: 'Vehicles', description: 'Company cars for official use' }
  });

  // 4. Create Assets
  // Available Laptops
  await prisma.asset.upsert({
    where: { assetTag: 'AF-LAP-001' },
    update: {},
    create: { assetTag: 'AF-LAP-001', name: 'MacBook Pro 16"', categoryId: catLaptop.id, status: 'AVAILABLE', serialNumber: 'MBP16-001', cost: 2500, location: 'HQ - IT Room' }
  });
  await prisma.asset.upsert({
    where: { assetTag: 'AF-LAP-002' },
    update: {},
    create: { assetTag: 'AF-LAP-002', name: 'Dell XPS 15', categoryId: catLaptop.id, status: 'AVAILABLE', serialNumber: 'DXPS-002', cost: 1800, location: 'HQ - IT Room' }
  });

  // Allocated Assets
  const allocAsset1 = await prisma.asset.upsert({
    where: { assetTag: 'AF-LAP-003' },
    update: {},
    create: { assetTag: 'AF-LAP-003', name: 'MacBook Pro 14"', categoryId: catLaptop.id, status: 'ALLOCATED', serialNumber: 'MBP14-003', cost: 2000, location: 'Remote' }
  });
  const allocAsset2 = await prisma.asset.upsert({
    where: { assetTag: 'AF-MON-001' },
    update: {},
    create: { assetTag: 'AF-MON-001', name: 'LG UltraFine 4K', categoryId: catMonitor.id, status: 'ALLOCATED', serialNumber: 'LG4K-001', cost: 700, location: 'HQ - Desk A12' }
  });

  // Maintenance Asset
  await prisma.asset.upsert({
    where: { assetTag: 'AF-VEH-001' },
    update: {},
    create: { assetTag: 'AF-VEH-001', name: 'Toyota Prius 2024', categoryId: catVehicle.id, status: 'UNDER_MAINTENANCE', serialNumber: 'VIN123456789', cost: 30000, location: 'Garage' }
  });

  // Generate 30 dummy assets
  const statuses = ['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED'];
  const locations = ['HQ - IT Room', 'Remote', 'Branch A', 'Warehouse', 'HQ - Desk B12'];
  const categoriesList = [catLaptop.id, catMonitor.id, catVehicle.id];
  const prefixes = ['AF-LAP-DUMMY-', 'AF-MON-DUMMY-', 'AF-VEH-DUMMY-'];

  for (let i = 1; i <= 30; i++) {
    const catIdx = i % 3;
    const tag = `${prefixes[catIdx]}${i.toString().padStart(3, '0')}`;
    const name = `Dummy Asset ${i}`;
    const status = statuses[i % 4];
    
    await prisma.asset.upsert({
      where: { assetTag: tag },
      update: {},
      create: { 
        assetTag: tag, 
        name: name, 
        categoryId: categoriesList[catIdx], 
        status: status, 
        serialNumber: `DUMMY-SN-${i}`, 
        cost: 1000 + (i * 10), 
        location: locations[i % 5] 
      }
    });
  }

  // 5. Create Allocations (to populate dashboard graphs and My Assets)
  const allocExists = await prisma.assetAllocation.findFirst({ where: { assetId: allocAsset1.id }});
  if (!allocExists) {
    await prisma.assetAllocation.create({
      data: {
        assetId: allocAsset1.id,
        userId: emp1.id,
        status: 'ACTIVE'
      }
    });
    await prisma.assetAllocation.create({
      data: {
        assetId: allocAsset2.id,
        userId: admin.id, // Assigned to admin for 'My Assets' view
        status: 'ACTIVE'
      }
    });
  }

  // Assign some dummy assets to Admin for 'My Assets'
  const availableDummyAssets = await prisma.asset.findMany({ where: { status: 'AVAILABLE' }, take: 5 });
  for (const asset of availableDummyAssets) {
    await prisma.assetAllocation.create({
      data: {
        assetId: asset.id,
        userId: admin.id,
        status: 'ACTIVE'
      }
    });
    // Mark as allocated
    await prisma.asset.update({ where: { id: asset.id }, data: { status: 'ALLOCATED' }});
  }

  // 6. Create Transfer Requests
  await prisma.transferRequest.create({
    data: {
      assetId: allocAsset1.id,
      fromUserId: emp1.id,
      toUserId: admin.id,
      status: 'PENDING'
    }
  });

  // 7. Create Bulk Bookings
  for (let i = 1; i <= 15; i++) {
    const isApproval = i % 2 === 0;
    const sDate = new Date();
    sDate.setDate(sDate.getDate() + i);
    const eDate = new Date();
    eDate.setDate(eDate.getDate() + i + Math.floor(Math.random() * 5) + 1);

    await prisma.booking.create({
      data: {
        assetId: availableDummyAssets[i % availableDummyAssets.length].id,
        userId: isApproval ? emp2.id : admin.id,
        startTime: sDate,
        endTime: eDate,
        status: i % 3 === 0 ? 'APPROVED' : i % 3 === 1 ? 'PENDING' : 'REJECTED'
      }
    });
  }

  // 8. Create Bulk Maintenance Requests
  const maintenanceIssues = ['Screen flickering', 'Battery drains fast', 'Keyboard sticky', 'Software crash', 'Overheating', 'Connectivity issues'];
  for (let i = 1; i <= 15; i++) {
    await prisma.maintenanceRequest.create({
      data: {
        assetId: availableDummyAssets[(i + 2) % availableDummyAssets.length].id,
        userId: i % 2 === 0 ? emp1.id : admin.id,
        issueDetails: maintenanceIssues[i % maintenanceIssues.length] + ` (Ticket #${i})`,
        priority: i % 4 === 0 ? 'HIGH' : i % 2 === 0 ? 'MEDIUM' : 'LOW',
        status: i % 3 === 0 ? 'RESOLVED' : i % 3 === 1 ? 'IN_PROGRESS' : 'PENDING'
      }
    });
  }

  // 9. Create Bulk Audit Cycles
  for (let i = 1; i <= 5; i++) {
    const sDate = new Date();
    sDate.setMonth(sDate.getMonth() - i);
    
    const audit = await prisma.auditCycle.create({
      data: {
        title: `Monthly IT Audit - Batch ${i}`,
        auditorId: admin.id,
        startDate: sDate,
        status: i === 1 ? 'ONGOING' : 'COMPLETED',
        endDate: i === 1 ? null : new Date(sDate.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Add 5 items per audit
    for (let j = 0; j < 5; j++) {
      const isVerified = j % 2 === 0 || i !== 1;
      await prisma.auditItem.create({
        data: {
          auditCycleId: audit.id,
          assetId: availableDummyAssets[(i + j) % availableDummyAssets.length].id,
          verified: isVerified,
          verifiedAt: isVerified ? new Date() : null,
          notes: isVerified ? 'All good' : 'Pending physical check'
        }
      });
    }
  }

  // 10. Create Activity Logs
  await prisma.activityLog.create({
    data: {
      userId: admin.id,
      action: 'CREATED_ASSET',
      details: 'Added 30 new dummy assets',
      ipAddress: '192.168.1.100'
    }
  });
  await prisma.activityLog.create({
    data: {
      userId: emp1.id,
      action: 'REQUESTED_MAINTENANCE',
      details: 'Reported battery issue on Laptop',
      ipAddress: '192.168.1.101'
    }
  });

  console.log('Database seeded successfully with all domains!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
