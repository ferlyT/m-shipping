import { eq } from 'drizzle-orm';
import { Elysia } from 'elysia';
import { db } from '../db';
import { invoices, customers } from '../db/schema';

export const invoiceRoutes = new Elysia()
  .get('/invoices', async () => {
    const data = await db.select({
      id: invoices.id,
      amount: invoices.amount,
      date: invoices.date,
      status: invoices.status,
      customerName: customers.name
    }).from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));
      
    return data.map(inv => ({
      id: inv.id,
      customer: inv.customerName || 'Unknown',
      amount: inv.amount,
      date: inv.date,
      status: inv.status
    }));
  })

  .get('/invoices/:id', async ({ params: { id } }) => {
    const data = await db.select({
      id: invoices.id,
      amount: invoices.amount,
      date: invoices.date,
      status: invoices.status,
      customerId: invoices.customerId,
      customerName: customers.name,
      customerAddress: customers.address
    }).from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id))
      .limit(1);
      
    if (!data.length) return { error: 'Not found' };
    
    const inv = data[0];
    return {
      id: inv.id,
      status: inv.status.toUpperCase(),
      amount: inv.amount,
      customer: {
        name: inv.customerName || 'Unknown',
        address: inv.customerAddress || 'Address not found'
      },
      dueDate: inv.date,
      issueDate: 'OCT 12, 2023',
      paymentMethod: 'Bank Transfer',
      paymentDetail: 'VA (•••• 9012)',
      items: [
        { name: 'Logistics Service', description: `Delivery charge for ${inv.id}`, amount: inv.amount }
      ],
      subtotal: inv.amount,
      tax: '0',
      total: inv.amount
    };
  });
