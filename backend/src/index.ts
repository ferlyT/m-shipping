import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { join } from 'path';

// Route modules
import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { customerRoutes } from './routes/customers';
import { shipmentRoutes } from './routes/shipments';
import { invoiceRoutes } from './routes/invoices';
import { profileRoutes } from './routes/profile';

const app = new Elysia()
  .use(cors())
  .get('/uploads/*', ({ params }) => {
    const path = params['*'];
    return Bun.file(join('uploads', path));
  })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'MSHIPPING_SECRET_KEY_2024'
    })
  )
  // Mount route modules
  .use(authRoutes)
  .use(dashboardRoutes)
  .use(customerRoutes)
  .use(shipmentRoutes)
  .use(invoiceRoutes)
  .use(profileRoutes)
  .listen({
    port: 3000,
    hostname: '0.0.0.0'
  });

console.log(`🚀 MShipping API is running at http://192.168.1.150:3000`);
console.log(`📱 Use this URL in your Expo app's api.ts file.`);
