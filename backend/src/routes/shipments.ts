import { and, eq, isNull } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../db';
import { shipments, couriers, journeySteps } from '../db/schema';

export const shipmentRoutes = new Elysia()
  .onBeforeHandle(async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !(await jwt.verify(token))) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })
  .get('/shipments', async () => {

    const data = await db.select().from(shipments).where(isNull(shipments.deletedAt));
    return data.map((s: any) => ({
      id: s.id,
      route: `${s.origin} -> ${s.destination}`,
      status: s.status,
      progress: s.status === 'Delivered' ? 1.0 : (s.status === 'In Transit' ? 0.65 : 0.1),
      currentStepIndex: s.status === 'Delivered' ? 4 : (s.status === 'In Transit' ? 2 : 0),
      eta: s.status === 'Delivered' ? 'Delivered' : '14:30 Today',
      cargo: `${s.palletCount} Pallets • ${s.weight}kg`
    }));
  }, {
    detail: { 
      tags: ['Shipments'], 
      summary: 'Get All Shipments', 
      description: 'Retrieve a high-level list of all active and past shipments.',
      security: [{ bearerAuth: [] }] 
    },
    response: {
      200: t.Array(t.Object({
        id: t.String(),
        route: t.String(),
        status: t.String(),
        progress: t.Number(),
        currentStepIndex: t.Number(),
        eta: t.String(),
        cargo: t.String()
      })),
      401: t.Object({ error: t.String() })
    }
  })

  .get('/shipments/:id', async ({ params: { id }, set }) => {
    try {
      const data = await db.select({
        id: shipments.id,
        status: shipments.status,
        weight: shipments.weight,
        palletCount: shipments.palletCount,
        temperature: shipments.temperature,
        coordinates: shipments.coordinates,
        origin: shipments.origin,
        destination: shipments.destination,
        courierId: shipments.courierId,
        courierName: couriers.name,
        courierImage: couriers.image,
        courierPhone: couriers.phone
      })
      .top(1)
      .from(shipments)
      .leftJoin(couriers, eq(shipments.courierId, couriers.id))
      .where(and(eq(shipments.id, id), isNull(shipments.deletedAt)));


      if (!data.length) {
        set.status = 404;
        return { error: 'Not found' };
      }
      
      const s = data[0];
      const steps = await db.select().from(journeySteps).where(eq(journeySteps.shipmentId, id));
      
      return {
        id: s.id,
        status: s.status.toUpperCase(),
        weight: parseFloat(s.weight || '0'),
        palletCount: s.palletCount || 0,
        temperature: parseFloat(s.temperature || '0'),
        coordinates: s.coordinates || '0° N, 0° E',
        courier: {
          name: s.courierName || 'Unassigned',
          id: s.courierId || 'N/A',
          image: s.courierImage || null,
          phone: s.courierPhone || ''
        },
        route: {
          from: s.origin,
          to: s.destination,
          mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNUjZlXaUQFmp_LLMiA7SeRPtGhYnYlWUYyQpQsjHmmqXMbLveVSzR23Tn4NpKkRoxP5621HL5b22zqS1GUKQDCCCCZWmC7d3wHzZyaRoguSrMs0SICmVeoBPZiDEMV_TvzqHQ5ImZmcQ4eJ5hBB1rU4EsLmX4RPz-yplLLHxbI8Uxh0-mf_-QLpIGBE2GSf_8tUUb1X5BjoRrlLk0z4V_k7FGdo_BYQ9gB5PVBLm0tcJs4AABDM7sjjAh48TNuLEPIFYW42oAFc'
        },
        manifest: [
          { name: 'Standard Goods', count: s.palletCount || 0 }
        ],
        journeySteps: steps.map((st: any) => ({
          label: st.label,
          time: st.time,
          status: st.status as any,
          iconType: st.iconType as any
        }))
      };
    } catch (err: any) {
      console.error('Shipment Detail Error:', err);
      set.status = 500;
      return { error: 'Internal Server Error', message: err.message };
    }
  }, {
    detail: { 
      tags: ['Shipments'], 
      summary: 'Get Shipment Details', 
      description: 'Retrieve detailed information for a specific shipment, including courier details, route, manifest, and journey steps.',
      security: [{ bearerAuth: [] }] 
    },
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: t.Object({
        id: t.String(),
        status: t.String(),
        weight: t.Number(),
        palletCount: t.Number(),
        temperature: t.Number(),
        coordinates: t.String(),
        courier: t.Object({
          name: t.String(),
          id: t.Union([t.Number(), t.String()]),
          image: t.Union([t.String(), t.Null()]),
          phone: t.String()
        }),
        route: t.Object({
          from: t.String(),
          to: t.String(),
          mapImage: t.String()
        }),
        manifest: t.Array(t.Object({
          name: t.String(),
          count: t.Number()
        })),
        journeySteps: t.Array(t.Object({
          label: t.String(),
          time: t.String(),
          status: t.String(),
          iconType: t.String()
        }))
      }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String(), message: t.Optional(t.String()) })
    }
  });

