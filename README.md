# BakerIQ Monorepo

A monorepo containing the BakerIQ platform services.

## Services

- **apps/app** - Main BakerIQ SaaS application (port 5000)
- **apps/market** - Consumer marketplace (port 3001)
- **apps/accounts** - OAuth authentication service (port 3002)

## Running the Applications

### Main App
```bash
npm run start:app
```

### Market Service
```bash
npm run start:market
```

### Accounts Service
```bash
npm run start:accounts
```

## Development

Each service can be run independently or all together using the npm workspace scripts.

## Deploy plan (Replit)

We will deploy three Repls pointing to this repo, each using a different working directory:

- **Repl A** → `/apps/app` → maps to `app.bakeriq.app`
- **Repl B** → `/apps/market` → maps to `market.bakeriq.app`
- **Repl C** → `/apps/accounts` → maps to `accounts.bakeriq.app`

Each Repl must set its own environment variables from the `.env.example` file in its subdir.

Stripe/Twilio/SES webhooks will be configured per subdomain service.

All services expose `GET /healthz` for uptime checks.

## Runbook

### How to add a new package to one workspace

```bash
# Install to specific workspace
npm install <package-name> --workspace apps/app
npm install <package-name> --workspace apps/market
npm install <package-name> --workspace apps/accounts
```

### How to add shared code in @bakeriq/shared

1. Edit `packages/shared/index.js`
2. Export your new function/constant:
```javascript
export function myNewUtil() {
  return "shared utility";
}
```

### How to consume @bakeriq/shared from an app

```javascript
import { ping, myNewUtil } from '@bakeriq/shared';

console.log(ping());        // "pong"
console.log(myNewUtil());   // "shared utility"
```
