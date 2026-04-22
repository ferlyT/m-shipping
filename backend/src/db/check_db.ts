import { db } from './index';
import { users } from './schema';

async function check() {
  console.log('--- USER LIST ---');
  const allUsers = await db.select().from(users);
  console.table(allUsers.map(u => ({ id: u.id, name: u.name, email: u.email })));
  process.exit(0);
}

check();
