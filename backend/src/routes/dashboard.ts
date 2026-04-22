import { Elysia } from 'elysia';
import { db } from '../db';
import { customers, shipments } from '../db/schema';

export const dashboardRoutes = new Elysia()
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
      recentCustomers: custCount.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        image: c.image,
        revenue: c.revenue || '0'
      })),
      activeShipmentsList: shipCount.slice(0, 2).map(s => ({
        id: s.id,
        route: `${s.origin} -> ${s.destination}`,
        progress: s.status === 'Delivered' ? 1.0 : (s.status === 'In Transit' ? 0.65 : 0.1),
        status: s.status
      }))
    };
  });
