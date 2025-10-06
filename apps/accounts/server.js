import express from 'express';
import { ping } from '@bakeriq/shared';

const app = express();
const PORT = process.env.PORT || 3002;

console.log(`[@bakeriq/accounts] Testing shared package: ping() = "${ping()}"`);

app.get('/healthz', (req, res) => {
  res.json({ ok: true, app: "accounts" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[@bakeriq/accounts] Server running on port ${PORT}`);
});
