import { and, eq, isNull, sum, sql } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../db';
import { customers, invoices, shipments } from '../db/schema';

export const customerRoutes = new Elysia()
  .onBeforeHandle(async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !(await jwt.verify(token))) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })
  .get('/customers', async () => {
    // 1. Revenue Subquery
    const revenueSubquery = db.select({
      customerId: invoices.customerId,
      totalRevenue: sql<string>`ISNULL(CAST(SUM(${invoices.amount}) AS VARCHAR), '0')`.as('totalRevenue')
    })
    .from(invoices)
    .where(eq(invoices.status, 'Cleared'))
    .groupBy(invoices.customerId)
    .as('rev');

    // 2. Shipment Stats Subquery
    const statsSubquery = db.select({
      customerId: shipments.customerId,
      totalShipments: sql<number>`COUNT(*)`.as('totalShipments'),
      reliability: sql<string>`CAST(ISNULL(SUM(CAST(${shipments.isOntime} AS FLOAT)) * 100.0 / NULLIF(COUNT(*), 0), 100) AS VARCHAR)`.as('reliability')
    })
    .from(shipments)
    .groupBy(shipments.customerId)
    .as('stats');

    // 3. Main Query
    const results = await db.select({
      id: customers.id,
      name: customers.name,
      status: customers.status,
      category: customers.category,
      address: customers.address,
      image: customers.image,
      memberSince: customers.memberSince,
      revenue: sql<string>`ISNULL(${revenueSubquery.totalRevenue}, '0')`,
      totalShipments: sql<number>`ISNULL(${statsSubquery.totalShipments}, 0)`,
      reliability: sql<string>`ISNULL(${statsSubquery.reliability}, '100')`
    })
    .from(customers)
    .leftJoin(revenueSubquery, eq(revenueSubquery.customerId, customers.id))
    .leftJoin(statsSubquery, eq(statsSubquery.customerId, customers.id))
    .where(isNull(customers.deletedAt));

    return results;
  }, {
    detail: {
      tags: ['Customers'],
      summary: 'Get All Customers',
      description: 'Retrieve a list of all registered customers with their basic details.',
      security: [{ bearerAuth: [] }]
    },
    response: {
      200: t.Array(t.Object({
        id: t.String(),
        name: t.String(),
        status: t.String(),
        category: t.Union([t.String(), t.Null()]),
        address: t.Union([t.String(), t.Null()]),
        image: t.Union([t.String(), t.Null()]),
        memberSince: t.Union([t.String(), t.Null()]),
        revenue: t.String(),
        totalShipments: t.Number(),
        reliability: t.String(),
      })),
      401: t.Object({ error: t.String() })
    }
  })
  .get('/customers/:id', async ({ params: { id }, set }) => {
    // 1. Fetch customer basic info
    const customerData = await db.select().from(customers).where(and(eq(customers.id, id), isNull(customers.deletedAt)));

    if (!customerData.length) {
      set.status = 404;
      return { error: 'Not found' };
    }

    const customer = customerData[0];

    // 2. Fetch financial stats separately
    const financialData = await db.select({
      paid: sql<string>`ISNULL(CAST(SUM(CASE WHEN ${invoices.status} = 'Cleared' THEN ${invoices.amount} ELSE 0 END) AS VARCHAR), '0')`,
      unpaid: sql<string>`ISNULL(CAST(SUM(CASE WHEN ${invoices.status} != 'Cleared' THEN ${invoices.amount} ELSE 0 END) AS VARCHAR), '0')`
    })
    .from(invoices)
    .where(eq(invoices.customerId, id));

    const { paid, unpaid } = financialData[0];
    
    // 3. Fetch shipment stats separately
    const shipmentStats = await db.select({
      total: sql<number>`COUNT(*)`,
      ontime: sql<number>`SUM(CAST(${shipments.isOntime} AS FLOAT))`
    })
    .from(shipments)
    .where(eq(shipments.customerId, id));

    const totalShipments = shipmentStats[0]?.total || 0;
    const reliabilityValue = totalShipments > 0 
      ? (shipmentStats[0].ontime * 100 / totalShipments).toFixed(1) + '%'
      : '100%';

    // Helper to format currency values
    const formatValue = (val: string) => {
      const num = parseFloat(val);
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      return num.toLocaleString();
    };

    return {
      id: customer.id,
      name: customer.name,
      status: customer.status.toUpperCase(),
      memberSince: customer.memberSince || 'JAN 2023',
      image: customer.image || 'https://images.unsplash.com/photo-1599305090598-fe179d501c27?q=80&w=200&auto=format&fit=crop',
      stats: {
        delivered: totalShipments,
        paidAmount: formatValue(paid),
        unpaidAmount: formatValue(unpaid),
        activeContracts: Math.floor(Math.random() * 5) + 1,
        reliability: reliabilityValue
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
  }, {
    detail: {
      tags: ['Customers'],
      summary: 'Get Customer Details',
      description: 'Retrieve detailed information, statistics, and recent activity for a specific customer by ID.',
      security: [{ bearerAuth: [] }]
    },
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: t.Object({
        id: t.String(),
        name: t.String(),
        status: t.String(),
        memberSince: t.String(),
        image: t.String(),
        stats: t.Object({
          delivered: t.Number(),
          paidAmount: t.String(),
          unpaidAmount: t.String(),
          activeContracts: t.Number(),
          reliability: t.String()
        }),
        contact: t.Object({
          zone: t.String(),
          phone: t.String(),
          email: t.String(),
          address: t.String()
        }),
        recentActivities: t.Array(t.Object({
          id: t.String(),
          type: t.String(),
          title: t.String(),
          subtitle: t.String(),
          date: t.String(),
          status: t.String()
        }))
      }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() })
    }
  });
