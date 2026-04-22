import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../db';
import { customers } from '../db/schema';

export const customerRoutes = new Elysia()
  .get('/customers', async () => {
    return await db.select().from(customers);
  })
  .get('/customers/:id', async ({ params: { id } }) => {
    const data = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!data.length) return { error: 'Not found' };
    
    const customer = data[0];
    
    // In a real app, these would be calculated from other tables
    // For now, we return a structured object that the frontend expects
    return {
      id: customer.id,
      name: customer.name,
      status: customer.status.toUpperCase(),
      memberSince: customer.memberSince || 'JAN 2023',
      image: customer.image || 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&auto=format&fit=crop',
      stats: {
        delivered: Math.floor(Math.random() * 1000) + 200,
        credits: customer.revenue || '0',
        creditLimit: '5.0B',
        activeContracts: Math.floor(Math.random() * 5) + 1,
        reliability: '98.5%'
      },
      contact: {
        zone: customer.category || 'Standard',
        phone: '+62 812 555 0000',
        email: `ops@${customer.name.toLowerCase().replace(/\s+/g, '-')}.com`,
        address: customer.address || 'Address not registered'
      },
      recentActivities: [
        { id: '1', type: 'SHIPMENT', title: 'SJ-2024-8892', subtitle: 'JKT -> SUB (In Transit)', date: '2h ago', status: 'ON_TRACK' },
        { id: '2', type: 'BILLING', title: 'INV-2024-0402', subtitle: 'IDR 4.25M Cleared', date: 'Yesterday', status: 'COMPLETED' },
      ]
    };
  });
