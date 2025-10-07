import express from "express";
import { createServer } from "http";
import { setupAuthRoutes } from "./authRoutes";

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Setup authentication routes
setupAuthRoutes(app);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Clean server is running',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.path}`
  });
});

// For non-API routes, let the frontend handle them (SPA fallback)
app.use('*', (req, res) => {
  // This would normally serve the frontend, but for testing we'll return a simple response
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head><title>BakerIQ</title></head>
    <body>
      <h1>BakerIQ Authentication Test</h1>
      <p>Clean auth server is running. API routes are working.</p>
      <p>Current route: ${req.originalUrl}</p>
    </body>
    </html>
  `);
});

const httpServer = createServer(app);

// Start server
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Clean auth server running on port ${PORT}`);
});

export { httpServer };