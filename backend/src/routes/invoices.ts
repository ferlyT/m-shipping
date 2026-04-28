import { and, eq, isNull } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../db';
import { invoices, customers, invoiceItems } from '../db/schema';

export const invoiceRoutes = new Elysia()
  .onBeforeHandle(async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !(await jwt.verify(token))) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })
  .get('/invoices', async () => {
    const data = await db.select({
      id: invoices.id,
      amount: invoices.amount,
      currency: invoices.currency,
      date: invoices.date,
      status: invoices.status,
      customerName: customers.name
    }).from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(isNull(invoices.deletedAt));
      
    return data.map((inv: any) => ({
      id: inv.id,
      customer: inv.customerName || 'Unknown',
      amount: String(inv.amount),
      currency: inv.currency || 'IDR',
      date: inv.date,
      status: inv.status
    }));
  }, {
    detail: { 
      tags: ['Invoices'], 
      summary: 'Get All Invoices', 
      description: 'Retrieve a list of all invoices with customer, amount and currency.',
      security: [{ bearerAuth: [] }] 
    },
    response: {
      200: t.Array(t.Object({
        id: t.String(),
        customer: t.String(),
        amount: t.String(),
        currency: t.String(),
        date: t.String(),
        status: t.String()
      })),
      401: t.Object({ error: t.String() })
    }
  })

  .get('/invoices/:id', async ({ params: { id }, set }) => {
    try {
      const invoiceId = id.trim();
      const data = await db.select({
        id: invoices.id,
        status: invoices.status,
        amount: invoices.amount,
        currency: invoices.currency,
        date: invoices.date,
        customerId: invoices.customerId,
        customerName: customers.name,
        customerAddress: customers.address
      })
      .top(1)
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

      if (!data.length) {
        set.status = 404;
        return { error: 'Not found' };
      }
      
      const inv = data[0];

      // Fetch items for this invoice
      const items = await db.select({
        name: invoiceItems.description,
        quantity: invoiceItems.quantity,
        unitPrice: invoiceItems.unitPrice,
        amount: invoiceItems.amount
      })
      .from(invoiceItems)
      .where(and(eq(invoiceItems.invoiceId, invoiceId), isNull(invoiceItems.deletedAt)));

      console.log(`[DEBUG] Found ${items.length} items for invoice ${id}`);

      return {
        id: inv.id,
        status: inv.status.toUpperCase(),
        amount: String(inv.amount),
        currency: inv.currency || 'IDR',
        customer: {
          name: inv.customerName || 'Unknown',
          address: inv.customerAddress || 'Address not found'
        },
        dueDate: inv.date,
        issueDate: 'OCT 12, 2023',
        paymentMethod: 'Bank Transfer',
        paymentDetail: 'VA (•••• 9012)',
        items: items.map(item => ({
          name: item.name,
          description: `${item.quantity} x ${item.unitPrice}`,
          amount: String(item.amount)
        })),
        subtotal: String(inv.amount),
        tax: '0',
        total: String(inv.amount)
      };
    } catch (err: any) {
      console.error('Invoice Detail Error:', err);
      set.status = 500;
      return { error: 'Internal Server Error', message: err.message };
    }
  }, {
    detail: { 
      tags: ['Invoices'], 
      summary: 'Get Invoice Details', 
      description: 'Retrieve detailed information for a specific invoice with items and currency.',
      security: [{ bearerAuth: [] }] 
    },
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: t.Object({
        id: t.String(),
        status: t.String(),
        amount: t.String(),
        currency: t.String(),
        customer: t.Object({
          name: t.String(),
          address: t.String()
        }),
        dueDate: t.String(),
        issueDate: t.String(),
        paymentMethod: t.String(),
        paymentDetail: t.String(),
        items: t.Array(t.Object({
          name: t.String(),
          description: t.String(),
          amount: t.String()
        })),
        subtotal: t.String(),
        tax: t.String(),
        total: t.String()
      }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String(), message: t.Optional(t.String()) })
    }
  });

