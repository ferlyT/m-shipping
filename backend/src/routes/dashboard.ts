import { Elysia, t } from 'elysia';
import { isNull } from 'drizzle-orm';
import { db } from '../db';
import { customers, shipments } from '../db/schema';

export const dashboardRoutes = new Elysia()
  .onBeforeHandle(async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !(await jwt.verify(token))) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })
  .get('/dashboard', async () => {

    const custCount = await db.select().from(customers).where(isNull(customers.deletedAt));
    const shipCount = await db.select().from(shipments).where(isNull(shipments.deletedAt));
    
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
      recentCustomers: custCount.slice(0, 3).map((c: any) => ({
        id: c.id,
        name: c.name,
        image: c.image,
        revenue: c.revenue || '0'
      })),
      activeShipmentsList: shipCount.slice(0, 2).map((s: any) => ({
        id: s.id,

        route: `${s.origin} -> ${s.destination}`,
        progress: s.status === 'Delivered' ? 1.0 : (s.status === 'In Transit' ? 0.65 : 0.1),
        status: s.status
      }))
    };
  }, {
    detail: { 
      tags: ['Dashboard'], 
      summary: 'Get Dashboard Statistics', 
      description: 'Retrieve general statistics, recent customers, and active shipments for the dashboard view.',
      security: [{ bearerAuth: [] }] 
    },
    response: {
      200: t.Object({
        stats: t.Object({
          revenue: t.String(),
          activeShipments: t.Number(),
          failedShipments: t.Number(),
          inProgress: t.Number(),
          revenueGrowth: t.String()
        }),
        customerAnalytics: t.Object({
          retention: t.String(),
          newCustomers: t.Number(),
          tier: t.String()
        }),
        recentCustomers: t.Array(t.Object({
          id: t.String(),
          name: t.String(),
          image: t.Union([t.String(), t.Null()]),
          revenue: t.String()
        })),
        activeShipmentsList: t.Array(t.Object({
          id: t.String(),
          route: t.String(),
          progress: t.Number(),
          status: t.String()
        }))

      }),
      401: t.Object({ error: t.String() })
    }
  });
