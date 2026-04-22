import { db } from './index';
import { users, customers, shipments, journeySteps, invoices } from './schema';

async function seed() {
  console.log('🌱 Generating Rich Operational Data...');

  // 1. Reset Data
  await db.delete(journeySteps);
  await db.delete(invoices);
  await db.delete(shipments);
  await db.delete(customers);
  await db.delete(users);

  // 2. Security Setup
  const hashedPass = await Bun.password.hash("password", { algorithm: "bcrypt", cost: 10 });
  const hashedAdmin = await Bun.password.hash("admin123", { algorithm: "bcrypt", cost: 10 });

  console.log('👥 Seeding Users...');
  await db.insert(users).values([
    { name: 'Alex Sterling', email: 'alex@mshipping.com', password: hashedAdmin, role: 'admin' },
    { name: 'ferly', email: 'ferly@mshipping.com', password: hashedPass, role: 'admin' }
  ]);

  console.log('🏢 Seeding 10 Premium Customers...');
  await db.insert(customers).values([
    { id: 'CUST-001', name: 'Global Logistics Corp', category: 'Major Account', type: 'Broker', revenue: '4.2B', status: 'Active', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop', memberSince: 'JAN 2022', address: 'Sudirman Central Business District, JKT' },
    { id: 'CUST-002', name: 'Indo Maritime Ltd', category: 'Standard', type: 'Direct', revenue: '1.2B', status: 'Active', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop', memberSince: 'FEB 2023', address: 'Tanjung Priok Port Area, JKT' },
    { id: 'CUST-003', name: 'Pacific Gateway Hub', category: 'Standard', type: 'Broker', revenue: '850M', status: 'Active', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=200&auto=format&fit=crop', memberSince: 'MAR 2023' },
    { id: 'CUST-004', name: 'Nusantara Freight', category: 'SME', type: 'Direct', revenue: '450M', status: 'Inactive', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=200&auto=format&fit=crop', address: 'Kawasan Industri Jababeka' },
    { id: 'CUST-005', name: 'Summit Supply Chain', category: 'Major Account', type: 'Broker', revenue: '2.8B', status: 'Active', address: 'Medan Industrial Estate' },
    { id: 'CUST-006', name: 'Andalas Logistics', category: 'Standard', type: 'Direct', revenue: '600M', status: 'Active', address: 'Palembang Hub' },
    { id: 'CUST-007', name: 'Celebes Maritime', category: 'SME', type: 'Direct', revenue: '320M', status: 'Active', address: 'Makassar Port' },
    { id: 'CUST-008', name: 'Borneo Express', category: 'Standard', type: 'Broker', revenue: '940M', status: 'Active', address: 'Balikpapan DC' },
    { id: 'CUST-009', name: 'Dewata Cargo', category: 'Standard', type: 'Direct', revenue: '710M', status: 'Active', address: 'Denpasar Airport Area' },
    { id: 'CUST-010', name: 'Papua Gateway', category: 'SME', type: 'Direct', revenue: '150M', status: 'Active', address: 'Jayapura Port' },
  ]);

  console.log('🚚 Seeding Active Shipments & Tracking...');
  await db.insert(shipments).values([
    { id: 'SJ-2024-8892', route: 'Jakarta Terminal -> Surabaya Hub', status: 'In Transit', progress: "0.65", currentStepIndex: 2, weight: "450.00", palletCount: 12, temperature: "4.2", coordinates: '6.1751° S, 106.8650° E', courierName: 'Marcus Vane', courierId: 'KNC-DRV-9901', courierImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', eta: '14:30 Today' },
    { id: 'SJ-2024-9011', route: 'Bandung DC -> Semarang South', status: 'In Transit', progress: "0.32", currentStepIndex: 1, weight: "1200.00", palletCount: 8, eta: '18:45 Today' },
    { id: 'SJ-2024-8741', route: 'Palembang Depot -> Lampung Hub', status: 'Delivered', progress: "1.00", currentStepIndex: 4, weight: "125.50", palletCount: 3, temperature: "22.0", eta: 'Delivered Yesterday' },
    { id: 'SJ-2024-9112', route: 'Makassar Port -> Manado DC', status: 'Pending', progress: "0.00", currentStepIndex: 0, cargo: 'Heavy Machinery Part', weight: "2400.00" },
    { id: 'SJ-2024-9255', route: 'Jakarta Hub -> Denpasar Airport', status: 'In Transit', progress: "0.88", currentStepIndex: 3, weight: "15.00", cargo: 'Electronic Components' },
  ]);

  console.log('📍 Seeding Journey Steps...');
  await db.insert(journeySteps).values([
    { shipmentId: 'SJ-2024-8892', label: 'Picked', time: '08:45 AM', status: 'past', iconType: 'package' },
    { shipmentId: 'SJ-2024-8892', label: 'Sorted', time: '11:30 AM', status: 'past', iconType: 'search' },
    { shipmentId: 'SJ-2024-8892', label: 'On Road', time: '02:15 PM', status: 'active', iconType: 'truck' },
    { shipmentId: 'SJ-2024-8892', label: 'Delivered', time: 'EST: 05:00 PM', status: 'future', iconType: 'pin' },
    { shipmentId: 'SJ-2024-9255', label: 'Arrived at Transit', time: '10:00 AM', status: 'past', iconType: 'package' },
    { shipmentId: 'SJ-2024-9255', label: 'Manifest Created', time: '12:00 PM', status: 'active', iconType: 'truck' },
  ]);

  console.log('💰 Seeding Financial Data...');
  await db.insert(invoices).values([
    { id: 'INV-2024-0401', customerId: 'CUST-001', amount: '12,450,000', date: '21 Oct 2024', status: 'Cleared' },
    { id: 'INV-2024-0402', customerId: 'CUST-002', amount: '4,250,500', date: '21 Oct 2024', status: 'Cleared' },
    { id: 'INV-2024-0395', customerId: 'CUST-001', amount: '15,000,000', date: '15 Oct 2024', status: 'Overdue' },
    { id: 'INV-2024-0398', customerId: 'CUST-003', amount: '8,900,000', date: '19 Oct 2024', status: 'Pending' },
    { id: 'INV-2024-0410', customerId: 'CUST-005', amount: '2,800,000', date: '20 Oct 2024', status: 'Cleared' },
    { id: 'INV-2024-0415', customerId: 'CUST-008', amount: '9,420,000', date: '21 Oct 2024', status: 'Pending' },
  ]);

  console.log('✅ DATABASE FULLY SEEDED!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
