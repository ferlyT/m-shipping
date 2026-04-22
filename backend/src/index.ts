import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { cors } from '@elysiajs/cors';
import { db } from './db';
import { users, customers, shipments, journeySteps, invoices } from './db/schema';
import { join } from 'path';

// Last Reload: 2026-04-21 16:54
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
  // --- Auth Route ---
  .post('/auth/login', async ({ body, jwt, set }) => {
    // In real app, verify password/biometric against DB
    const token = await jwt.sign({
      id: 1,
      name: 'Alex Sterling'
    });
    return { token, user: { id: 1, name: 'Alex Sterling', email: 'alex@mshipping.com' } };
  })
  
  // --- Dashboard Route ---
  .get('/dashboard', async () => {
    const custCount = await db.select().from(customers);
    const shipCount = await db.select().from(shipments);
    
    return {
      stats: {
        revenue: '124.5M',
        activeShipments: shipCount.length,
        failedShipments: 3,
        inProgress: 18,
        revenueGrowth: '+12.5%'
      },
      customerAnalytics: {
        retention: '85%',
        newCustomers: custCount.length,
        tier: 'Platinum'
      },
      recentCustomers: custCount.slice(0, 3),
      activeShipmentsList: shipCount.slice(0, 2)
    };
  })

  // --- Customers Routes ---
  .get('/customers', async () => {
    return await db.select().from(customers);
  })
  .get('/customers/:id', async ({ params: { id } }) => {
    const data = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return data[0] || { error: 'Not found' };
  })

  // --- Shipments Routes ---
  .get('/shipments', async () => {
    return await db.select().from(shipments);
  })
  .get('/shipments/:id', async ({ params: { id } }) => {
    const data = await db.select().from(shipments).where(eq(shipments.id, id)).limit(1);
    if (!data.length) return { error: 'Not found' };
    
    // Fetch steps
    const steps = await db.select().from(journeySteps).where(eq(journeySteps.shipmentId, id));
    
    return {
      ...data[0],
      journeySteps: steps
    };
  })

  // --- Profile Route ---
  .get('/profile', async () => {
    try {
      console.log('🔍 FETCHING PROFILE: Checking ferly@mshipping.com...');
      // Find Ferly by email (more reliable than ID)
      let user = await db.select().from(users).where(eq(users.email, 'ferly@mshipping.com')).limit(1);
      
      console.log('📊 DB RESULT:', user.length > 0 ? `Found: ${user[0].name}` : 'Not Found');

      if (!user.length) {
        // Fallback to Alex
        user = await db.select().from(users).where(eq(users.email, 'alex@mshipping.com')).limit(1);
      }

      if (!user.length) {
        // EMERGENCY FALLBACK: Only if DB is truly empty
        return {
          id: 0,
          name: 'Ferly (Local Mode)',
          email: 'ferly@mshipping.com',
          avatar: null,
          stats: { trustScore: 100, activeStreak: 1 }
        };
      }
      
      return {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        avatar: user[0].avatar || null,
        isBiometricEnabled: user[0].isBiometricEnabled === 1,
        stats: {
          trustScore: 99.8,
          activeStreak: 45
        }
      };
    } catch (e) {
      return { error: 'Database connection issue' };
    }
  })

  .patch('/profile/biometric', async ({ body }: { body: { enabled: boolean } }) => {
    await db.update(users)
      .set({ isBiometricEnabled: body.enabled ? 1 : 0 })
      .where(eq(users.email, 'ferly@mshipping.com'));
    return { success: true };
  })

  .patch('/profile/avatar', async ({ body }: { body: { file: File } }) => {
    const file = body.file;
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const filePath = join('uploads', fileName);
    
    // Save file to disk using Bun
    await Bun.write(filePath, file);
    
    // Create the public URL
    const publicUrl = `http://192.168.1.150:3000/uploads/${fileName}`;

    await db.update(users)
      .set({ avatar: publicUrl })
      .where(eq(users.email, 'ferly@mshipping.com'));
      
    return { success: true, avatarUrl: publicUrl };
  }, {
    body: t.Object({
      file: t.File()
    })
  })

  .patch('/profile/update', async ({ body }: { body: { name: string, email: string } }) => {
    const oldEmail = 'ferly@mshipping.com'; // Keep track of the current user
    await db.update(users)
      .set({ name: body.name, email: body.email })
      .where(eq(users.email, oldEmail));
      
    return { success: true, message: 'Profile updated successfully' };
  })

  .patch('/profile/password', async ({ body }: { body: { password: string } }) => {
    const hashedPassword = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, 'ferly@mshipping.com'));
      
    return { success: true, message: 'Password updated successfully' };
  })

  // --- Invoices Route ---
  .get('/invoices', () => [
    { id: 'INV-2024-0401', customer: 'Global Logistics Corp', amount: '12,450,000', date: '21 Oct 2024', status: 'Cleared' },
    { id: 'INV-2024-0395', customer: 'Nusantara Freight', amount: '15,000,000', date: '15 Oct 2024', status: 'Overdue' },
  ])

  .listen({
    port: 3000,
    hostname: '0.0.0.0'
  });

console.log(`🚀 MShipping API is running at http://192.168.1.150:3000`);
console.log(`📱 Use this URL in your Expo app's api.ts file.`);
