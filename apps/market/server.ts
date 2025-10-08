import express from 'express';
import { db } from './db';
import { vendorClaims, claimAuditLog } from './schema';
import { handleClaimApproval } from './webhooks';

const app = express();
const PORT = parseInt(process.env.MARKET_PORT || '3001', 10);

// JSON body parser
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, app: "market" });
});

// Home page
app.get('/', (req, res) => {
  res.send('<html><body><h1>BakerIQ Marketplace online</h1></body></html>');
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

// ========================================
// VENDOR CLAIMS ENDPOINTS
// ========================================

// Create a new claim (for vendors to claim their profile)
app.post('/api/claims', async (req, res) => {
  try {
    const { vendorId, email, name, businessName, phone } = req.body;

    if (!vendorId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [claim] = await db
      .insert(vendorClaims)
      .values({
        vendorId,
        email,
        name,
        businessName,
        phone,
        status: 'pending',
      })
      .returning();

    // Log audit
    await db.insert(claimAuditLog).values({
      claimId: claim.id,
      action: 'created',
      performedBy: email,
      details: JSON.stringify({ vendorId, email, name }),
    });

    console.log('[Marketplace] Claim created:', claim.id);

    res.json({ success: true, claimId: claim.id });
  } catch (error: any) {
    console.error('[Marketplace] Error creating claim:', error);
    res.status(500).json({ error: 'Failed to create claim' });
  }
});

// Approve a claim (admin only - in production, add auth middleware)
app.post('/api/claims/:claimId/approve', async (req, res) => {
  try {
    const { claimId } = req.params;
    const { approvedBy } = req.body; // In production, get from authenticated admin user

    if (!approvedBy) {
      return res.status(400).json({ error: 'approvedBy is required' });
    }

    await handleClaimApproval(claimId, approvedBy);

    res.json({ success: true, message: 'Claim approved and baker provisioned' });
  } catch (error: any) {
    console.error('[Marketplace] Error approving claim:', error);
    res.status(500).json({ error: error.message || 'Failed to approve claim' });
  }
});

// Get all claims (admin only - in production, add auth middleware)
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await db.query.vendorClaims.findMany({
      orderBy: (claims, { desc }) => [desc(claims.createdAt)],
    });

    res.json({ claims });
  } catch (error: any) {
    console.error('[Marketplace] Error fetching claims:', error);
    res.status(500).json({ error: 'Failed to fetch claims' });
  }
});

// Get claim audit log
app.get('/api/claims/:claimId/audit', async (req, res) => {
  try {
    const { claimId } = req.params;

    const auditLogs = await db.query.claimAuditLog.findMany({
      where: (logs, { eq }) => eq(logs.claimId, claimId),
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    });

    res.json({ auditLogs });
  } catch (error: any) {
    console.error('[Marketplace] Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[@bakeriq/market] Server running on 0.0.0.0:${PORT}`);
});
