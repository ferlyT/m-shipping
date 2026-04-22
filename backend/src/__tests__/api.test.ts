/**
 * MShipping Backend API - Unit Tests
 * 
 * Uses Bun's built-in test runner.
 * Run: bun test src/__tests__/api.test.ts
 * 
 * These tests hit the live API endpoints.
 * Ensure the backend is running: bun run dev
 */

import { describe, test, expect, beforeAll } from 'bun:test';

const BASE_URL = 'http://192.168.1.150:3000';

// Helper to make requests
async function api(method: string, endpoint: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

// ==========================================
// 1. DASHBOARD
// ==========================================
describe('Dashboard API', () => {
  test('GET /dashboard returns valid structure', async () => {
    const { status, data } = await api('GET', '/dashboard');
    expect(status).toBe(200);

    // stats
    expect(data.stats).toBeDefined();
    expect(typeof data.stats.revenue).toBe('string');
    expect(typeof data.stats.activeShipments).toBe('number');
    expect(typeof data.stats.failedShipments).toBe('number');
    expect(typeof data.stats.inProgress).toBe('number');
    expect(typeof data.stats.revenueGrowth).toBe('string');

    // customerAnalytics
    expect(data.customerAnalytics).toBeDefined();
    expect(typeof data.customerAnalytics.retention).toBe('string');
    expect(typeof data.customerAnalytics.newCustomers).toBe('number');

    // recentCustomers array
    expect(Array.isArray(data.recentCustomers)).toBe(true);
    if (data.recentCustomers.length > 0) {
      const c = data.recentCustomers[0];
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.revenue).toBeDefined();
    }

    // activeShipmentsList array
    expect(Array.isArray(data.activeShipmentsList)).toBe(true);
    if (data.activeShipmentsList.length > 0) {
      const s = data.activeShipmentsList[0];
      expect(s.id).toBeDefined();
      expect(s.route).toBeDefined();
      expect(typeof s.progress).toBe('number');
      expect(s.status).toBeDefined();
    }
  });
});

// ==========================================
// 2. CUSTOMERS
// ==========================================
describe('Customers API', () => {
  test('GET /customers returns array', async () => {
    const { status, data } = await api('GET', '/customers');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /customers returns items with correct fields', async () => {
    const { data } = await api('GET', '/customers');
    if (data.length > 0) {
      const c = data[0];
      expect(c.id).toBeDefined();
      expect(c.name).toBeDefined();
      expect(c.status).toBeDefined();
    }
  });

  test('GET /customers/:id returns customer detail', async () => {
    const { data: list } = await api('GET', '/customers');
    if (list.length === 0) return; // skip if no data

    const { status, data } = await api('GET', `/customers/${list[0].id}`);
    expect(status).toBe(200);
    expect(data.id).toBe(list[0].id);
    expect(data.name).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.stats.delivered).toBeDefined();
    expect(data.stats.credits).toBeDefined();
    expect(data.contact).toBeDefined();
    expect(data.contact.email).toBeDefined();
    expect(Array.isArray(data.recentActivities)).toBe(true);
  });

  test('GET /customers/:id returns error for non-existent customer', async () => {
    const { data } = await api('GET', '/customers/DOES-NOT-EXIST-999');
    expect(data.error).toBe('Not found');
  });
});

// ==========================================
// 3. SHIPMENTS
// ==========================================
describe('Shipments API', () => {
  test('GET /shipments returns array', async () => {
    const { status, data } = await api('GET', '/shipments');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /shipments items have required fields', async () => {
    const { data } = await api('GET', '/shipments');
    if (data.length > 0) {
      const s = data[0];
      expect(s.id).toBeDefined();
      expect(s.route).toBeDefined();
      expect(s.status).toBeDefined();
      expect(typeof s.progress).toBe('number');
      expect(s.eta).toBeDefined();
      expect(s.cargo).toBeDefined();
    }
  });

  test('GET /shipments/:id returns detailed shipment', async () => {
    const { data: list } = await api('GET', '/shipments');
    if (list.length === 0) return;

    const { status, data } = await api('GET', `/shipments/${list[0].id}`);
    expect(status).toBe(200);
    expect(data.id).toBe(list[0].id);
    expect(data.status).toBeDefined();
    expect(typeof data.weight).toBe('number');
    expect(typeof data.palletCount).toBe('number');

    // Courier info
    expect(data.courier).toBeDefined();
    expect(data.courier.name).toBeDefined();
    expect(data.courier.id).toBeDefined();

    // Route info
    expect(data.route).toBeDefined();
    expect(data.route.from).toBeDefined();
    expect(data.route.to).toBeDefined();

    // Journey steps
    expect(Array.isArray(data.journeySteps)).toBe(true);
    expect(data.journeySteps.length).toBeGreaterThan(0);
    const step = data.journeySteps[0];
    expect(step.label).toBeDefined();
    expect(step.status).toBeDefined();
  });

  test('GET /shipments/:id returns error for non-existent shipment', async () => {
    const { data } = await api('GET', '/shipments/DOES-NOT-EXIST');
    expect(data.error).toBe('Not found');
  });
});

// ==========================================
// 4. COURIERS (via shipments)
// ==========================================
describe('Couriers Integration', () => {
  test('Shipment detail includes courier data from couriers table', async () => {
    const { data: list } = await api('GET', '/shipments');
    if (list.length === 0) return;

    const { data } = await api('GET', `/shipments/${list[0].id}`);
    expect(data.courier).toBeDefined();
    expect(data.courier.name).not.toBe('Unassigned');
    expect(data.courier.id).not.toBe('N/A');
  });
});

// ==========================================
// 5. INVOICES
// ==========================================
describe('Invoices API', () => {
  test('GET /invoices returns array', async () => {
    const { status, data } = await api('GET', '/invoices');
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /invoices items have required fields', async () => {
    const { data } = await api('GET', '/invoices');
    if (data.length > 0) {
      const inv = data[0];
      expect(inv.id).toBeDefined();
      expect(inv.customer).toBeDefined();
      expect(inv.amount).toBeDefined();
      expect(inv.status).toBeDefined();
    }
  });

  test('GET /invoices/:id returns detailed invoice', async () => {
    const { data: list } = await api('GET', '/invoices');
    if (list.length === 0) return;

    const { status, data } = await api('GET', `/invoices/${list[0].id}`);
    expect(status).toBe(200);
    expect(data.id).toBe(list[0].id);
    expect(data.status).toBeDefined();
    expect(data.amount).toBeDefined();
    expect(data.customer).toBeDefined();
    expect(data.customer.name).toBeDefined();
    expect(data.customer.address).toBeDefined();
    expect(data.dueDate).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.subtotal).toBeDefined();
    expect(data.total).toBeDefined();
  });

  test('GET /invoices/:id returns error for non-existent invoice', async () => {
    const { data } = await api('GET', '/invoices/DOES-NOT-EXIST');
    expect(data.error).toBe('Not found');
  });
});

// ==========================================
// 6. PROFILE
// ==========================================
describe('Profile API', () => {
  test('GET /profile returns user data', async () => {
    const { status, data } = await api('GET', '/profile');
    expect(status).toBe(200);
    expect(data.id).toBeDefined();
    expect(data.name).toBeDefined();
    expect(data.email).toBeDefined();
    expect(typeof data.isBiometricEnabled).toBe('boolean');
    expect(data.language).toBeDefined();
    expect(data.theme).toBeDefined();
    expect(data.stats).toBeDefined();
  });

  test('PATCH /profile/update updates name and email', async () => {
    // First get current profile
    const { data: before } = await api('GET', '/profile');
    const originalName = before.name;
    const originalEmail = before.email;

    // Update
    const { data: result } = await api('PATCH', '/profile/update', {
      name: 'Test User',
      email: 'test@mshipping.com'
    });
    expect(result.success).toBe(true);

    // Verify
    const { data: after } = await api('GET', '/profile');
    expect(after.name).toBe('Test User');
    expect(after.email).toBe('test@mshipping.com');

    // Restore original values
    await api('PATCH', '/profile/update', {
      name: originalName,
      email: originalEmail
    });
  });

  test('PATCH /profile/settings updates language', async () => {
    const { data: before } = await api('GET', '/profile');
    const originalLang = before.language;

    const { data: result } = await api('PATCH', '/profile/settings', {
      language: 'id'
    });
    expect(result.success).toBe(true);

    const { data: after } = await api('GET', '/profile');
    expect(after.language).toBe('id');

    // Restore
    await api('PATCH', '/profile/settings', { language: originalLang });
  });

  test('PATCH /profile/biometric toggles biometric', async () => {
    const { data: before } = await api('GET', '/profile');
    const originalValue = before.isBiometricEnabled;

    const { data: result } = await api('PATCH', '/profile/biometric', {
      enabled: !originalValue
    });
    expect(result.success).toBe(true);

    const { data: after } = await api('GET', '/profile');
    expect(after.isBiometricEnabled).toBe(!originalValue);

    // Restore
    await api('PATCH', '/profile/biometric', { enabled: originalValue });
  });

  test('PATCH /profile/password changes password', async () => {
    const { data: result } = await api('PATCH', '/profile/password', {
      password: 'NewTestPassword123!'
    });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Password updated successfully');
  });
});

// ==========================================
// 7. AUTH
// ==========================================
describe('Auth API', () => {
  test('POST /auth/login returns token and user', async () => {
    const { status, data } = await api('POST', '/auth/login', {
      email: 'test@test.com',
      password: 'password'
    });
    expect(status).toBe(200);
    expect(data.token).toBeDefined();
    expect(typeof data.token).toBe('string');
    expect(data.user).toBeDefined();
    expect(data.user.name).toBeDefined();
  });
});

// ==========================================
// 8. RESPONSE FORMAT VALIDATION
// ==========================================
describe('Response Format Validation', () => {
  test('All GET endpoints return valid JSON', async () => {
    const endpoints = [
      '/dashboard',
      '/customers',
      '/shipments',
      '/invoices',
      '/profile'
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      expect(res.headers.get('content-type')).toContain('application/json');

      const text = await res.text();
      expect(() => JSON.parse(text)).not.toThrow();
    }
  });

  test('Dashboard route has consistent field types', async () => {
    // Call twice and verify structure is stable
    const { data: d1 } = await api('GET', '/dashboard');
    const { data: d2 } = await api('GET', '/dashboard');

    expect(Object.keys(d1.stats).sort()).toEqual(Object.keys(d2.stats).sort());
    expect(Object.keys(d1.customerAnalytics).sort()).toEqual(Object.keys(d2.customerAnalytics).sort());
  });
});
