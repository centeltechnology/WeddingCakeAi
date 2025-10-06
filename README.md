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
