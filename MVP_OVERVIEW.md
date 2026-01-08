# BakerIQ - MVP Overview

**Status:** MVP Development  
**Target Launch:** 2 weeks

---

## What is BakerIQ?

A simple lead capture tool for bakers. Customers use a pricing calculator to get cake estimates, and bakers receive those leads directly in their inbox.

---

## MVP Features (v1.0)

### For Customers
- **Cake Calculator** - Interactive pricing tool with size, flavors, and decoration options
- **Instant Estimates** - Real-time price calculations
- **Lead Submission** - Contact form captures customer details and cake requirements

### For Bakers
- **Personal Calculator Link** - Each baker gets a unique URL: `bakeriq.app/c/your-bakery-name`
- **Lead Inbox** - View all calculator submissions with customer details and cake preferences
- **Pricing Configuration** - Customize cake sizes, flavors, decorations, and prices
- **Quote Builder** - Create quotes from leads (pre-filled with calculator data)
- **Quote Delivery** - Send quotes to customers via email

### Core Workflow
```
Customer visits calculator → Submits cake request → Baker sees lead → Creates quote → Sends to customer
```

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Drizzle ORM)
- **Email:** AWS SES

---

## URL Structure

| URL | Purpose |
|-----|---------|
| `/c/:slug` | Public calculator for a specific baker |
| `/login` | Baker login |
| `/dashboard/:slug` | Baker dashboard |
| `/leads` | Lead inbox |
| `/quotes` | Quote management |
| `/settings/pricing` | Pricing configuration |

---

## Getting Started (Bakers)

1. Sign up for an account
2. Configure your pricing (sizes, flavors, decorations)
3. Share your calculator link with customers
4. View leads in your inbox
5. Create and send quotes

---

## Future Additions (Post-MVP)

### Phase 2 - Customer Experience
- [ ] Contract management and e-signatures
- [ ] Customer portal for quote approval
- [ ] Payment collection (Stripe integration)

### Phase 3 - Business Tools
- [ ] Booking and calendar management
- [ ] Email automation and templates
- [ ] Analytics dashboard

### Phase 4 - Growth Features
- [ ] AI-powered pricing suggestions
- [ ] Lead scoring
- [ ] Public bakery profiles and marketplace
- [ ] Team management

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5000
```

---

## Contact

For questions or support, contact the development team.
