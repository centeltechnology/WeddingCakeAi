# Host-Based Routing for Local Demos

This document shows how to set up Express host-based routing to dispatch requests to different service routers based on the incoming host header. **This is for local development demos only** - production will use separate Repls.

## Example Implementation

```javascript
import express from 'express';
import { appRouter } from '../apps/app/server/routes.js';
import { marketRouter } from '../apps/market/routes.js';
import { accountsRouter } from '../apps/accounts/routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware: JSON parsing
app.use(express.json());

// Host-based routing middleware
app.use((req, res, next) => {
  const host = req.headers.host || '';
  
  // Remove port from host for matching
  const hostname = host.split(':')[0];
  
  if (hostname.includes('market.')) {
    // Route to market service
    return marketRouter(req, res, next);
  } else if (hostname.includes('accounts.')) {
    // Route to accounts service
    return accountsRouter(req, res, next);
  } else {
    // Default to main app service
    return appRouter(req, res, next);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Multi-service router listening on 0.0.0.0:${PORT}`);
  console.log(`- app.localhost:${PORT} → Main App`);
  console.log(`- market.localhost:${PORT} → Market Service`);
  console.log(`- accounts.localhost:${PORT} → Accounts Service`);
});
```

## Testing Locally

Add entries to your `/etc/hosts` file:

```
127.0.0.1 app.localhost
127.0.0.1 market.localhost
127.0.0.1 accounts.localhost
```

Then test with curl:

```bash
# Main app
curl http://app.localhost:5000/healthz
# {"ok":true,"app":"app"}

# Market service
curl http://market.localhost:5000/healthz
# {"ok":true,"app":"market"}

# Accounts service
curl http://accounts.localhost:5000/healthz
# {"ok":true,"app":"accounts"}
```

## Production Deployment

In production, **do not use host-based routing**. Instead:

- Deploy each service to its own Repl
- Each Repl uses its own working directory (`/apps/app`, `/apps/market`, `/apps/accounts`)
- Each Repl maps to its own subdomain (`app.bakeriq.app`, `market.bakeriq.app`, `accounts.bakeriq.app`)
- Each Repl has its own environment variables and health check endpoint
