import { eq, and, isNull } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { join } from 'path';
import { db } from '../db';
import { users } from '../db/schema';

export const profileRoutes = new Elysia()
  .get('/profile', async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    try {
      const user = await db.select().top(1).from(users).where(and(eq(users.id, payload.id), isNull(users.deletedAt)));

      
      if (!user.length) {
        set.status = 404;
        return { error: 'User not found' };
      }
      
      const userData = user[0];
      return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        company: userData.company || '',
        address: userData.address || '',
        avatar: userData.avatar || null,
        isBiometricEnabled: userData.isBiometricEnabled === 1,
        language: userData.language || 'en',
        theme: userData.theme || 'system',
        notificationsEnabled: userData.notificationsEnabled === 1,
        stats: {
          trustScore: 99.8,
          activeStreak: 45
        }
      };
    } catch (e) {
      set.status = 500;
      return { error: 'Database connection issue' };
    }
  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Get User Profile', 
      description: 'Retrieve the detailed profile information of the current user, including preferences and stats.',
      security: [{ bearerAuth: [] }] 
    },
    response: {
      200: t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        phone: t.String(),
        company: t.String(),
        address: t.String(),
        avatar: t.Union([t.String(), t.Null()]),
        isBiometricEnabled: t.Boolean(),
        language: t.String(),
        theme: t.String(),
        notificationsEnabled: t.Boolean(),
        stats: t.Object({
          trustScore: t.Number(),
          activeStreak: t.Number()
        })
      }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() }),
      500: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/biometric', async ({ body, jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    await db.update(users)
      .set({ isBiometricEnabled: body.enabled ? 1 : 0 })
      .where(eq(users.id, payload.id));
    return { success: true };
  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Toggle Biometric Login', 
      description: 'Enable or disable biometric authentication for the current user.',
      security: [{ bearerAuth: [] }] 
    },
    body: t.Object({
      enabled: t.Boolean()
    }),
    response: {
      200: t.Object({ success: t.Boolean() }),
      401: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/avatar', async ({ body, jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const file = body.file;
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const filePath = join('uploads', fileName);
    
    await Bun.write(filePath, file);
    
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${fileName}`;

    await db.update(users)
      .set({ avatar: publicUrl })
      .where(eq(users.id, payload.id));
      
    return { success: true, avatarUrl: publicUrl };
  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Upload User Avatar', 
      description: 'Upload a new avatar image for the current user using multipart/form-data.',
      security: [{ bearerAuth: [] }] 
    },
    body: t.Object({
      file: t.File()
    }),
    response: {
      200: t.Object({ success: t.Boolean(), avatarUrl: t.String() }),
      401: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/update', async ({ body, jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
    
    // Manual validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      set.status = 422;
      return { error: 'Invalid email format' };
    }
    
    const updateData: any = { name: body.name, email: body.email };
    if (body.phone) updateData.phone = body.phone;
    if (body.company) updateData.company = body.company;
    if (body.address) updateData.address = body.address;
    
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, payload.id));
      
    return { success: true, message: 'Profile updated successfully' };

  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Update User Profile Information', 
      description: 'Update the basic profile details of the current user such as name and email.',
      security: [{ bearerAuth: [] }] 
    },
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      phone: t.Optional(t.String()),
      company: t.Optional(t.String()),
      address: t.Optional(t.String())
    }),
    response: {
      200: t.Object({ success: t.Boolean(), message: t.String() }),
      401: t.Object({ error: t.String() }),
      422: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/password', async ({ body, jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    if (body.password.length < 6) {
      set.status = 422;
      return { error: 'Password too short' };
    }

    if (body.password !== body.confirmPassword) {
      set.status = 422;
      return { error: 'Passwords do not match' };
    }

    const hashedPassword = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, payload.id));
      
    return { success: true, message: 'Password updated successfully' };

  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Update User Password', 
      description: 'Change the password for the current user. Requires a minimum length of 6 characters and matching confirmation.',
      security: [{ bearerAuth: [] }] 
    },
    body: t.Object({
      password: t.String({ minLength: 6 }),
      confirmPassword: t.String({ minLength: 6 })
    }),
    response: {
      200: t.Object({ success: t.Boolean(), message: t.String() }),
      401: t.Object({ error: t.String() }),
      422: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/settings', async ({ body, jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const updateData: any = {};
    if (body.language) updateData.language = body.language;
    if (body.theme) updateData.theme = body.theme;
    if (typeof body.notificationsEnabled !== 'undefined') updateData.notificationsEnabled = body.notificationsEnabled ? 1 : 0;

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, payload.id));
      
    return { success: true };
  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Update User App Settings', 
      description: 'Update application preferences for the current user, including language, theme, and notifications.',
      security: [{ bearerAuth: [] }] 
    },
    body: t.Object({
      language: t.Optional(t.String()),
      theme: t.Optional(t.String()),
      notificationsEnabled: t.Optional(t.Boolean())
    }),
    response: {
      200: t.Object({ success: t.Boolean() }),
      401: t.Object({ error: t.String() })
    }
  })

  .patch('/profile/deactivate', async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, payload.id));
      
    return { success: true, message: 'Account deactivated successfully' };
  }, {
    detail: { 
      tags: ['Profile'], 
      summary: 'Deactivate User Account (Soft Delete)', 
      description: 'Mark the current user account as deleted without removing it from the database.',
      security: [{ bearerAuth: [] }] 
    },
    response: {
      200: t.Object({ success: t.Boolean(), message: t.String() }),
      401: t.Object({ error: t.String() })
    }
  });


