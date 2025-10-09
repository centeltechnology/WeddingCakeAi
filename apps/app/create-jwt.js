import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const payload = {
  sub: 'baker-demo-1',
  userId: 'baker-demo-1',
  role: 'baker',
  tenantId: 'tenant-demo-1'
};

const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
console.log(token);
