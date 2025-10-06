import express from 'express';
import jwt from 'jsonwebtoken';
import { ping } from '@bakeriq/shared';

const app = express();
const PORT = process.env.ACCOUNTS_PORT || 3002;

// Prove workspace wiring on boot
console.log(`[@bakeriq/accounts] Shared package test: ping() = "${ping()}"`);

// JSON body parser
app.use(express.json());

// Mock in-memory user data
const mockUsers = {
  'user123': { sub: 'user123', email: 'john@bakery.com', vendorType: 'baker' },
  'user456': { sub: 'user456', email: 'jane@cakes.com', vendorType: 'decorator' }
};

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, app: "accounts" });
});

// OAuth token endpoint
app.post('/oauth/token', (req, res) => {
  const { code } = req.body;
  
  console.log('[/oauth/token] Request with code:', code);
  
  // Generate fake tokens (stateless demo)
  const access_token = jwt.sign(
    { sub: 'user123', type: 'access' },
    process.env.JWT_PRIVATE_KEY || 'dev-only-fake',
    { expiresIn: '1h' }
  );
  
  const refresh_token = jwt.sign(
    { sub: 'user123', type: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET || 'dev-only-fake',
    { expiresIn: '7d' }
  );
  
  res.json({
    access_token,
    refresh_token,
    expires_in: 3600
  });
});

// User info endpoint
app.get('/userinfo', (req, res) => {
  // In a real implementation, this would decode the access token
  // For now, return mock data for user123
  const mockUser = mockUsers['user123'];
  
  console.log('[/userinfo] Returning user info for:', mockUser.sub);
  
  res.json(mockUser);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[@bakeriq/accounts] Server running on 0.0.0.0:${PORT}`);
});
