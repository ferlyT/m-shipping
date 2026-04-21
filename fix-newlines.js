const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'app');
const files = ['index.tsx', 'dashboard.tsx', 'orders-invoices.tsx', 'surat-jalan.tsx', 'invoice.tsx', 'customer-profile.tsx'];

files.forEach(f => {
  const filePath = path.join(dir, f);
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace literal '\n' with actual newline
  code = code.replace(/\\n/g, '\n');

  fs.writeFileSync(filePath, code);
});
console.log('Fixed newlines!');
