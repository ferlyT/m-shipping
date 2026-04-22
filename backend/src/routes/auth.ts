import { Elysia } from 'elysia';

export const authRoutes = new Elysia()
  .post('/auth/login', async ({ body, jwt, set }: any) => {
    // In real app, verify password/biometric against DB
    const token = await jwt.sign({
      id: 1,
      name: 'Alex Sterling'
    });
    return { token, user: { id: 1, name: 'Alex Sterling', email: 'alex@mshipping.com' } };
  });
