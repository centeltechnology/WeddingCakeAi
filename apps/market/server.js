import express from 'express';
import { ping } from '@bakeriq/shared';

const app = express();
const PORT = process.env.PORT || 3001;

console.log(`[@bakeriq/market] Testing shared package: ping() = "${ping()}"`);

app.get('/healthz', (req, res) => {
  res.json({ ok: true, app: "market" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[@bakeriq/market] Server running on port ${PORT}`);
});
