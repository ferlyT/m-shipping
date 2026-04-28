import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { join } from 'path';
import { swagger } from '@elysiajs/swagger';

// Route modules
import { authRoutes } from './routes/auth';
import { dashboardRoutes } from './routes/dashboard';
import { customerRoutes } from './routes/customers';
import { shipmentRoutes } from './routes/shipments';
import { invoiceRoutes } from './routes/invoices';
import { profileRoutes } from './routes/profile';
import { addressRoutes } from './routes/addresses';

export const app = new Elysia()
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'MShipping API',
        version: '1.0.0',
        description: 'Comprehensive backend API documentation for the MShipping mobile application. Handles authentication, shipments, invoices, customers, and user profiles.',
        contact: {
          name: 'MShipping Technical Support',
          url: 'https://mshipping.com/support',
          email: 'support@mshipping.com'
        },
        license: {
          name: 'Proprietary',
          url: 'https://mshipping.com/license'
        }
      },
      externalDocs: {
        description: 'Find out more about MShipping',
        url: 'https://mshipping.com/docs'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    }
  }))
  .use(cors())
  .get('/uploads/*', ({ params }) => {
    const path = params['*'];
    return Bun.file(join('uploads', path));
  })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'MSHIPPING_SECRET_KEY_2024',
      exp: '24h'
    })
  )
  // Mount route modules
  .use(authRoutes)
  .use(dashboardRoutes)
  .use(customerRoutes)
  .use(shipmentRoutes)
  .use(invoiceRoutes)
  .use(profileRoutes)
  .use(addressRoutes);

if (import.meta.main) {
  const port = process.env.APP_PORT || 3000;
  app.listen({
    port,
    hostname: '0.0.0.0'
  });

  console.log(`🚀 MShipping API is running at ${process.env.APP_BASE_URL || `http://localhost:${port}`}`);
  console.log(`📱 Use this URL in your Expo app's api.ts file.`);
}


