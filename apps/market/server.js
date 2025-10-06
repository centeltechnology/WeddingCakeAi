import express from 'express';
import { ping } from '@bakeriq/shared';

const app = express();
const PORT = process.env.MARKET_PORT || 3001;

// Prove workspace wiring on boot
console.log(`[@bakeriq/market] Shared package test: ping() = "${ping()}"`);

// JSON body parser
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, app: "market" });
});

// Home page
app.get('/', (req, res) => {
  res.send('<html><body><h1>BakerIQ Market online</h1></body></html>');
});

// Vendor profile page
app.get('/v/:vendor', (req, res) => {
  const { vendor } = req.params;
  res.send(`
    <html>
      <body>
        <h1>Vendor Profile: ${vendor}</h1>
        <p>This is a placeholder vendor profile page.</p>
      </body>
    </html>
  `);
});

// Checkout endpoint
app.post('/api/checkout', (req, res) => {
  console.log('[/api/checkout] Request body:', req.body);
  res.json({ sessionId: "test" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[@bakeriq/market] Server running on 0.0.0.0:${PORT}`);
});
