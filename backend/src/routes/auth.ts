import { Elysia, t } from 'elysia';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';

export const authRoutes = new Elysia()
  .post('/auth/login', async ({ body, jwt, set }: any) => {
    const { email, password } = body;
    console.log(`[AUTH] Attempting login for: ${email}`);
    
    // Find user by email (not deleted)
    const user = await db.select().top(1).from(users).where(and(eq(users.email, email), isNull(users.deletedAt)));
    console.log(`[AUTH] Users found: ${user.length}`);


    
    if (!user.length) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }

    // Check password
    const isPasswordCorrect = await Bun.password.verify(password, user[0].password);
    if (!isPasswordCorrect) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }


    const token = await jwt.sign({
      id: user[0].id,
      name: user[0].name
    });

    return { 
      token, 
      serverSignature: process.env.SERVER_SIGNATURE || 'MSHIPPING_V2_SECURE',
      user: { 
        id: user[0].id, 
        name: user[0].name, 
        email: user[0].email,
        avatar: user[0].avatar,
        isBiometricEnabled: user[0].isBiometricEnabled === 1
      } 
    };

  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    }),
    response: {
      200: t.Object({
        token: t.String(),
        serverSignature: t.String(),
        user: t.Object({
          id: t.Number(),
          name: t.String(),
          email: t.String(),
          avatar: t.Union([t.String(), t.Null()]),
          isBiometricEnabled: t.Boolean()
        })
      }),
      401: t.Object({
        error: t.String()
      })
    },
    detail: {
      tags: ['Auth'],
      summary: 'User Login',
      description: 'Authenticate user with email and password to receive a JWT token.'
    }
  })
  
  .get('/auth/me', async ({ jwt, headers, set }) => {
    const auth = headers['authorization'];
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const user = await db.select().top(1).from(users).where(and(eq(users.id, payload.id), isNull(users.deletedAt)));
    
    if (!user.length) {
      set.status = 404;
      return { error: 'User not found' };
    }

    return {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      avatar: user[0].avatar,
      isBiometricEnabled: user[0].isBiometricEnabled === 1
    };
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Get Current User',
      description: 'Retrieve the profile information of the currently authenticated user based on their JWT token.',
      security: [{ bearerAuth: [] }]
    },
    response: {
      200: t.Object({
        id: t.Number(),
        name: t.String(),
        email: t.String(),
        avatar: t.Union([t.String(), t.Null()]),
        isBiometricEnabled: t.Boolean()
      }),
      401: t.Object({ error: t.String() }),
      404: t.Object({ error: t.String() })
    }
  });
