import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { join } from 'path';
import { db } from '../db';
import { users } from '../db/schema';

export const profileRoutes = new Elysia()
  .get('/profile', async () => {
    try {
      // Get the first user from database as current user (until auth is implemented)
      let user = await db.select().from(users).limit(1);
      
      console.log('📊 DB RESULT:', user.length > 0 ? `Found: ${user[0].name} (${user[0].email})` : 'Not Found');

      if (!user.length) {
        return {
          id: 0,
          name: 'Guest',
          email: 'guest@mshipping.com',
          avatar: null,
          stats: { trustScore: 0, activeStreak: 0 }
        };
      }
      
      return {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        avatar: user[0].avatar || null,
        isBiometricEnabled: user[0].isBiometricEnabled === 1,
        language: user[0].language || 'en',
        theme: user[0].theme || 'system',
        notificationsEnabled: user[0].notificationsEnabled === 1,
        stats: {
          trustScore: 99.8,
          activeStreak: 45
        }
      };
    } catch (e) {
      return { error: 'Database connection issue' };
    }
  })

  .patch('/profile/biometric', async ({ body }: { body: { enabled: boolean } }) => {
    const user = await db.select().from(users).limit(1);
    if (!user.length) return { error: 'No user found' };
    await db.update(users)
      .set({ isBiometricEnabled: body.enabled ? 1 : 0 })
      .where(eq(users.id, user[0].id));
    return { success: true };
  })

  .patch('/profile/avatar', async ({ body }: { body: { file: File } }) => {
    const file = body.file;
    const fileName = `avatar_${Date.now()}_${file.name}`;
    const filePath = join('uploads', fileName);
    
    // Save file to disk using Bun
    await Bun.write(filePath, file);
    
    // Create the public URL
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/uploads/${fileName}`;

    const user = await db.select().from(users).limit(1);
    if (!user.length) return { error: 'No user found' };

    await db.update(users)
      .set({ avatar: publicUrl })
      .where(eq(users.id, user[0].id));
      
    return { success: true, avatarUrl: publicUrl };
  }, {
    body: t.Object({
      file: t.File()
    })
  })

  .patch('/profile/update', async ({ body }: { body: { name: string, email: string } }) => {
    const user = await db.select().from(users).limit(1);
    if (!user.length) return { error: 'No user found' };
    await db.update(users)
      .set({ name: body.name, email: body.email })
      .where(eq(users.id, user[0].id));
      
    return { success: true, message: 'Profile updated successfully' };
  })

  .patch('/profile/password', async ({ body }: { body: { password: string } }) => {
    const hashedPassword = await Bun.password.hash(body.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await db.select().from(users).limit(1);
    if (!user.length) return { error: 'No user found' };

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, user[0].id));
      
    return { success: true, message: 'Password updated successfully' };
  })

  .patch('/profile/settings', async ({ body }: { body: { language?: string, theme?: string, notificationsEnabled?: boolean } }) => {
    const updateData: any = {};
    if (body.language) updateData.language = body.language;
    if (body.theme) updateData.theme = body.theme;
    if (typeof body.notificationsEnabled !== 'undefined') updateData.notificationsEnabled = body.notificationsEnabled ? 1 : 0;

    const user = await db.select().from(users).limit(1);
    if (!user.length) return { error: 'No user found' };

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, user[0].id));
      
    return { success: true };
  });
