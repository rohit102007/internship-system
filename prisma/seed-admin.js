const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
p.user.upsert({
  where: { email: 'admin@internconnect.local' },
  update: {},
  create: {
    email: 'admin@internconnect.local',
    password: bcrypt.hashSync('Admin@12345', 10),
    role: 'ADMIN',
    name: 'System Administrator',
  },
}).then(u => { console.log('Admin ready:', u.email); return p.$disconnect(); })
  .catch(e => { console.error(e.message); process.exit(1); });
