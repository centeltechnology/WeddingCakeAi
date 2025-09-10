import type { Express } from "express";
import jwt from "jsonwebtoken";
import { databaseStorage } from "./databaseStorage";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_key_change_in_production';

// Helper to create JWT token
function createToken(userId: string, username: string, role: string): string {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setupAuthRoutes(app: Express) {
  // Super Admin Authentication
  app.post('/api/clean-auth/super-admin/setup', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if any super admin already exists
      const existingUsers = await databaseStorage.getUsersWithRole('super_admin');
      if (existingUsers.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Super admin account already exists. Use the login page instead.'
        });
      }

      // Validate input
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if username already exists
      const existingUser = await databaseStorage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }

      // Hash password and create user
      const hashedPassword = await databaseStorage.hashPassword(password);
      const user = await databaseStorage.createUser({
        username,
        email,
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      });

      // Create JWT token  
      const token = createToken(user.id, username, user.role);

      res.json({
        success: true,
        message: 'Super admin account created successfully',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Super admin setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during setup'
      });
    }
  });

  app.post('/api/clean-auth/super-admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Find user
      const user = await databaseStorage.getUserByUsername(username);
      if (!user || user.role !== 'super_admin') {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValidPassword = await databaseStorage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      if (!user.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is disabled' 
        });
      }

      // Update last login
      await databaseStorage.updateUserLastLogin(user.id);

      // Create JWT token
      const token = createToken(user.id, username, user.role);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Super admin login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  });

  // Baker Authentication
  app.post('/api/bakers/register', async (req, res) => {
    try {
      const { name, email, password, address, phone } = req.body;

      // Validate input
      if (!name || !email || !password || !address) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, password, and address are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if email already exists
      const existingBaker = await databaseStorage.getBakerByEmail(email);
      if (existingBaker) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password and create baker
      const hashedPassword = await databaseStorage.hashPassword(password);
      const baker = await databaseStorage.createBaker({
        name,
        email,
        password: hashedPassword,
        address,
        phone,
        isActive: true,
        subscriptionPlan: 'starter'
      });

      // Create JWT token
      const token = createToken(baker.id, baker.email, 'baker');

      res.status(201).json({
        success: true,
        message: 'Baker registered successfully',
        token,
        baker: {
          id: baker.id,
          name: baker.name,
          slug: baker.slug,
          email: baker.email,
          address: baker.address,
          phone: baker.phone,
          subscriptionPlan: baker.subscriptionPlan
        }
      });

    } catch (error) {
      console.error('Baker registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration'
      });
    }
  });

  app.post('/api/bakers/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      // Find baker
      const baker = await databaseStorage.getBakerByEmail(email);
      if (!baker) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValidPassword = await databaseStorage.verifyPassword(password, baker.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      if (!baker.isActive) {
        return res.status(401).json({ 
          success: false, 
          message: 'Account is disabled' 
        });
      }

      // Create JWT token
      const token = createToken(baker.id, baker.email, 'baker');

      res.json({
        success: true,
        message: 'Login successful',
        token,
        baker: {
          id: baker.id,
          name: baker.name,
          slug: baker.slug,
          email: baker.email,
          address: baker.address,
          phone: baker.phone,
          subscriptionPlan: baker.subscriptionPlan
        }
      });

    } catch (error) {
      console.error('Baker login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login'
      });
    }
  });

  // Baker dashboard route (slug-based)
  app.get('/baker/:slug/dashboard', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Find baker by slug
      const baker = await databaseStorage.getBakerBySlug(slug);
      if (!baker) {
        return res.status(404).json({
          success: false,
          message: 'Baker not found'
        });
      }

      // Return baker dashboard data
      res.json({
        success: true,
        baker: {
          id: baker.id,
          name: baker.name,
          slug: baker.slug,
          email: baker.email,
          address: baker.address,
          phone: baker.phone,
          subscriptionPlan: baker.subscriptionPlan,
          isActive: baker.isActive
        }
      });

    } catch (error) {
      console.error('Baker dashboard error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get baker info by slug (for frontend routing)
  app.get('/baker/:slug/info', async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Find baker by slug
      const baker = await databaseStorage.getBakerBySlug(slug);
      if (!baker) {
        return res.status(404).json({
          success: false,
          message: 'Baker not found'
        });
      }

      // Return baker info (public data)
      res.json({
        success: true,
        id: baker.id,
        name: baker.name,
        slug: baker.slug,
        email: baker.email,
        address: baker.address,
        phone: baker.phone,
        subscriptionPlan: baker.subscriptionPlan,
        isActive: baker.isActive
      });

    } catch (error) {
      console.error('Baker info error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Health check route
  app.get('/api/auth/health', (req, res) => {
    res.json({
      success: true,
      message: 'Auth routes are working',
      timestamp: new Date().toISOString()
    });
  });
}