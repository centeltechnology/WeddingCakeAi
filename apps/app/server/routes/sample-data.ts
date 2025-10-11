import { Router } from "express";
import { requireTenant } from "../lib/context";
import { storage } from "../storage";
import { ensureAuthUnified } from "../authUnified";

const router = Router();

const SAMPLE_LEADS = [
  {
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@email.com",
    customerPhone: "(555) 123-4567",
    weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    guestCount: 150,
    budget: "$2500-3000",
    message: "Looking for a 3-tier wedding cake with buttercream frosting. Would love to discuss floral decorations!",
    status: "new",
    source: "website_contact",
    cityOrZip: "90210",
    notes: "High priority - wedding is in 3 months"
  },
  {
    customerName: "Michael Chen",
    customerEmail: "mchen@company.com",
    customerPhone: "(555) 234-5678",
    weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days from now
    guestCount: 75,
    budget: "$1500-2000",
    message: "Need a birthday cake for company event. Vanilla with chocolate ganache. Serves 75 people.",
    status: "new",
    source: "referral",
    cityOrZip: "10001",
    notes: "Corporate client - potential for recurring business"
  },
  {
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@gmail.com",
    customerPhone: "(555) 345-6789",
    weddingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
    guestCount: 200,
    budget: "$3500+",
    message: "Planning a large wedding reception. Interested in tasting appointments for custom cake designs.",
    status: "new",
    source: "instagram",
    cityOrZip: "60601",
    notes: "Mentioned budget flexibility - high value lead"
  }
];

router.post("/api/leads/sample", ensureAuthUnified, async (req, res) => {
  try {
    const { tenantId } = requireTenant(req);

    // Check if tenant already has leads (idempotent)
    const existingLeads = await storage.getLeadsByTenant(tenantId);
    if (existingLeads.length > 0) {
      return res.json({
        message: "Tenant already has leads, skipping sample data creation",
        created: false,
        count: existingLeads.length
      });
    }

    // Create sample leads
    const createdLeads = [];
    for (const sampleLead of SAMPLE_LEADS) {
      const lead = await storage.createLead({
        ...sampleLead,
        tenantId
      });
      createdLeads.push(lead);
    }

    res.json({
      message: "Sample leads created successfully",
      created: true,
      leads: createdLeads
    });
  } catch (error: any) {
    console.error("Error creating sample leads:", error);
    // Return 401 for unauthorized/missing tenant, 500 for other errors
    const statusCode = error.message?.includes("Unauthorized") ? 401 : 500;
    res.status(statusCode).json({ error: error.message || "Failed to create sample leads" });
  }
});

export default router;
