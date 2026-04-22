import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../db';
import { shipments, couriers, journeySteps } from '../db/schema';

export const shipmentRoutes = new Elysia()
  .get('/shipments', async () => {
    const data = await db.select().from(shipments);
    return data.map(s => ({
      id: s.id,
      route: `${s.origin} -> ${s.destination}`,
      status: s.status,
      progress: s.status === 'Delivered' ? 1.0 : (s.status === 'In Transit' ? 0.65 : 0.1),
      currentStepIndex: s.status === 'Delivered' ? 4 : (s.status === 'In Transit' ? 2 : 0),
      eta: s.status === 'Delivered' ? 'Delivered' : '14:30 Today',
      cargo: `${s.palletCount} Pallets • ${s.weight}kg`
    }));
  })

  .get('/shipments/:id', async ({ params: { id } }) => {
    const data = await db.select({
      id: shipments.id,
      status: shipments.status,
      weight: shipments.weight,
      palletCount: shipments.palletCount,
      temperature: shipments.temperature,
      coordinates: shipments.coordinates,
      origin: shipments.origin,
      destination: shipments.destination,
      mapImage: shipments.mapImage,
      courierId: couriers.id,
      courierName: couriers.name,
      courierImage: couriers.image,
      courierPhone: couriers.phone
    }).from(shipments)
      .leftJoin(couriers, eq(shipments.courierId, couriers.id))
      .where(eq(shipments.id, id))
      .limit(1);

    if (!data.length) return { error: 'Not found' };
    
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
        mapImage: s.mapImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjNUjZlXaUQFmp_LLMiA7SeRPtGhYnYlWUYyQpQsjHmmqXMbLveVSzR23Tn4NpKkRoxP5621HL5b22zqS1GUKQDCCCCZWmC7d3wHzZyaRoguSrMs0SICmVeoBPZiDEMV_TvzqHQ5ImZmcQ4eJ5hBB1rU4EsLmX4RPz-yplLLHxbI8Uxh0-mf_-QLpIGBE2GSf_8tUUb1X5BjoRrlLk0z4V_k7FGdo_BYQ9gB5PVBLm0tcJs4AABDM7sjjAh48TNuLEPIFYW42oAFc'
      },
      manifest: [
        { name: 'Standard Goods', count: s.palletCount || 0 }
      ],
      journeySteps: steps.length > 0 ? steps.map(st => ({
        label: st.label,
        time: st.time,
        status: st.status as any,
        iconType: st.iconType as any
      })) : [
        { label: 'Picked', time: '08:45 AM', status: 'past', iconType: 'package' },
        { label: 'In Transit', time: '02:15 PM', status: 'active', iconType: 'truck' },
        { label: 'Delivered', time: 'TBD', status: 'future', iconType: 'pin' }
      ]
    };
  });
