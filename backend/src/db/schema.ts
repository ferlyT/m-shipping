import { mysqlTable, serial, varchar, decimal, int, timestamp, text, json } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  password: text('password').notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  avatar: text('avatar'),
  isBiometricEnabled: int('is_biometric_enabled').default(0), // 0: false, 1: true
  language: varchar('language', { length: 10 }).default('en'),
  theme: varchar('theme', { length: 20 }).default('system'),
  notificationsEnabled: int('notifications_enabled').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

export const customers = mysqlTable('customers', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. CUST-001
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  type: varchar('type', { length: 100 }),
  revenue: varchar('revenue', { length: 50 }),
  status: varchar('status', { length: 20 }).default('Active'),
  image: text('image'),
  memberSince: varchar('member_since', { length: 50 }),
  address: text('address'),
});

export const couriers = mysqlTable('couriers', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. KNC-DRV-9901
  name: varchar('name', { length: 100 }).notNull(),
  image: text('image'),
  phone: varchar('phone', { length: 50 }),
  status: varchar('status', { length: 20 }).default('Active'),
});

export const shipments = mysqlTable('shipments', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g. SJ-2024-8892
  customerId: varchar('customer_id', { length: 50 }).references(() => customers.id),
  courierId: varchar('courier_id', { length: 50 }).references(() => couriers.id),
  origin: varchar('origin', { length: 255 }).notNull(),
  destination: varchar('destination', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }),
  palletCount: int('pallet_count'),
  temperature: decimal('temperature', { precision: 5, scale: 2 }),
  coordinates: varchar('coordinates', { length: 100 }),
  mapImage: text('map_image'),
  // Fields for the list view or fallback
  eta: varchar('eta', { length: 100 }),
  cargo: text('cargo'),
});

export const journeySteps = mysqlTable('journey_steps', {
  id: serial('id').primaryKey(),
  shipmentId: varchar('shipment_id', { length: 50 }).references(() => shipments.id),
  label: varchar('label', { length: 255 }).notNull(),
  time: varchar('time', { length: 100 }),
  status: varchar('status', { length: 20 }), // past, active, future
  iconType: varchar('icon_type', { length: 50 }),
});

export const invoices = mysqlTable('invoices', {
  id: varchar('id', { length: 50 }).primaryKey(),
  customerId: varchar('customer_id', { length: 50 }).references(() => customers.id),
  amount: varchar('amount', { length: 50 }).notNull(),
  date: varchar('date', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // Cleared, Pending, Overdue
});
