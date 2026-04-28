import { Elysia, t } from 'elysia';
import { db } from '../db';
import { customerAddresses } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const addressRoutes = new Elysia()
  .onBeforeHandle(async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token || !(await jwt.verify(token))) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  })

  // Get all addresses for a specific customer
  .get('/customers/:id/addresses', async ({ params: { id } }) => {
    return await db.select()
      .from(customerAddresses)
      .where(and(
        eq(customerAddresses.customerId, id),
        isNull(customerAddresses.deletedAt)
      ));
  }, {
    detail: {
      tags: ['Addresses'],
      summary: 'Get Customer Addresses',
      description: 'Retrieve all active shipping and billing addresses for a specific customer.',
      security: [{ bearerAuth: [] }]
    },
    params: t.Object({
      id: t.String()
    }),
    response: {
      200: t.Array(t.Object({
        id: t.Number(),
        customerId: t.String(),
        type: t.String(),
        label: t.String(),
        address: t.String(),
        city: t.Union([t.String(), t.Null()]),
        postalCode: t.Union([t.String(), t.Null()]),
        isDefault: t.Number(),
        createdAt: t.Any(),
        updatedAt: t.Any(),
        deletedAt: t.Union([t.Any(), t.Null()])
      })),
      401: t.Object({ error: t.String() })
    }
  })

  // Add a new address for a customer
  .post('/customers/:id/addresses', async ({ params: { id }, body }) => {
    const newAddress = {
      ...body,
      customerId: id,
      isDefault: body.isDefault ? 1 : 0
    };

    // If setting as default, unset others of same type first
    if (newAddress.isDefault === 1) {
      await db.update(customerAddresses)
        .set({ isDefault: 0 })
        .where(and(
          eq(customerAddresses.customerId, id),
          eq(customerAddresses.type, body.type)
        ));
    }

    const result = await db.insert(customerAddresses).values(newAddress);
    return { success: true, message: 'Address added successfully' };
  }, {
    detail: {
      tags: ['Addresses'],
      summary: 'Add Customer Address',
      description: 'Add a new shipping or billing address to a customer.',
      security: [{ bearerAuth: [] }]
    },
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      type: t.String(), // 'shipping' | 'billing'
      label: t.String(),
      address: t.String(),
      city: t.Optional(t.String()),
      postalCode: t.Optional(t.String()),
      isDefault: t.Boolean()
    }),
    response: {
      200: t.Object({ success: t.Boolean(), message: t.String() }),
      401: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String() })
    }
  })

  // Update an existing address
  .patch('/addresses/:addressId', async ({ params: { addressId }, body }) => {
    const updateData: any = { ...body };
    if (typeof body.isDefault !== 'undefined') {
      updateData.isDefault = body.isDefault ? 1 : 0;
    }

    await db.update(customerAddresses)
      .set(updateData)
      .where(eq(customerAddresses.id, parseInt(addressId)));
      
    return { success: true };
  }, {
    detail: {
      tags: ['Addresses'],
      summary: 'Update Address',
      description: 'Modify details of an existing customer address.',
      security: [{ bearerAuth: [] }]
    },
    params: t.Object({
      addressId: t.String()
    }),
    body: t.Partial(t.Object({
      label: t.String(),
      address: t.String(),
      city: t.String(),
      postalCode: t.String(),
      isDefault: t.Boolean()
    })),
    response: {
      200: t.Object({ success: t.Boolean() }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() })
    }
  })

  // Soft delete an address
  .delete('/addresses/:addressId', async ({ params: { addressId } }) => {
    await db.update(customerAddresses)
      .set({ deletedAt: new Date() })
      .where(eq(customerAddresses.id, parseInt(addressId)));
      
    return { success: true, message: 'Address deleted successfully' };
  }, {
    detail: {
      tags: ['Addresses'],
      summary: 'Delete Address',
      description: 'Soft delete a customer address.',
      security: [{ bearerAuth: [] }]
    },
    params: t.Object({
      addressId: t.String()
    }),
    response: {
      200: t.Object({ success: t.Boolean(), message: t.String() }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() })
    }
  });
