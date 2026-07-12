import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/auth.routes';
import dashboardRoutes from './dashboard/dashboard.routes';
import departmentRoutes from './departments/departments.routes';
import userRoutes from './users/users.routes';
import categoryRoutes from './categories/categories.routes';
import assetRoutes from './assets/assets.routes';
import allocationRoutes from './allocations/allocations.routes';
import transferRoutes from './transfers/transfers.routes';
import bookingRoutes from './bookings/bookings.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AssetFlow API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
