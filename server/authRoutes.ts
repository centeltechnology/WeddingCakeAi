import type { Express } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { databaseStorage } from "./databaseStorage";
import { sendEmail, emailTemplates } from "./emailService";

// Harden JWT security - fail fast in production if JWT_SECRET is not set
const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET;
  
  // In production, require a proper JWT secret to be set
  if (process.env.NODE_ENV === 'production' && (!secret || secret.length < 32)) {
    throw new Error('JWT_SECRET must be set to a strong secret (32+ characters) in production environment');
  }
  
  // Allow fallback only in development
  return secret || 'fallback_dev_secret_key_change_in_production_DO_NOT_USE_THIS_IN_PROD';
})();

// Helper to create JWT token
function createToken(userId: string, username: string, role: string): string {
  return jwt.sign(
    { userId, username, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setupAuthRoutes(app: Express) {
  // TODO: SECURITY IMPROVEMENTS FOR PRODUCTION READINESS
  // 1. Implement rate limiting on authentication endpoints to prevent brute force attacks
  //    - Add express-rate-limit middleware with appropriate limits for login/register/resend
  //    - Consider progressive delays for repeated failed attempts
  // 2. Implement secure token hashing in database
  //    - Hash verification tokens before storing in database 
  //    - Use bcrypt or similar for verification token storage
  // 3. Add session management and logout functionality
  //    - Implement proper session invalidation
  //    - Add token blacklisting for logout
  // 4. Enhance password security
  //    - Implement password strength validation
  //    - Add password history to prevent reuse
  // 5. Add login attempt monitoring and account lockout
  //    - Track failed login attempts per account
  //    - Implement temporary account lockout after multiple failures
  
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
      const token = createToken(user.id!, username, user.role);

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

      // Generate verification token with expiry
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = databaseStorage.createVerificationTokenExpiry();
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;

      // Hash password and create baker
      const hashedPassword = await databaseStorage.hashPassword(password);
      const baker = await databaseStorage.createBaker({
        name,
        email,
        password: hashedPassword,
        address,
        phone,
        isActive: true,
        subscriptionPlan: 'starter',
        emailVerified: false,
        verificationToken,
        verificationTokenExpiry
      });

      // Send verification email
      let emailSent = false;
      try {
        const emailTemplate = emailTemplates.emailVerification(name, verificationUrl);
        emailSent = await sendEmail({
          to: email,
          toName: name,
          subject: emailTemplate.subject,
          textPart: emailTemplate.textPart,
          htmlPart: emailTemplate.htmlPart
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue with registration even if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Baker registered successfully! Please check your email to verify your account.',
        requiresVerification: true,
        emailSent,
        baker: {
          id: baker.id,
          name: baker.name,
          slug: baker.slug,
          email: baker.email,
          emailVerified: baker.emailVerified
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

      // Check if email is verified
      if (!baker.emailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address before logging in. Check your email for the verification link.',
          requiresVerification: true
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

  app.post('/api/bakers/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Find baker by email
      const baker = await databaseStorage.getBakerByEmail(email);
      if (!baker) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address'
        });
      }

      // Check if already verified
      if (baker.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already verified'
        });
      }

      // Generate new verification token and expiry
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = databaseStorage.createVerificationTokenExpiry();
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;

      // Update baker with new token
      await databaseStorage.updateBaker(baker.id, {
        verificationToken,
        verificationTokenExpiry
      });

      // Send verification email
      let emailSent = false;
      try {
        const emailTemplate = emailTemplates.emailVerification(baker.name, verificationUrl);
        emailSent = await sendEmail({
          to: email,
          toName: baker.name,
          subject: emailTemplate.subject,
          textPart: emailTemplate.textPart,
          htmlPart: emailTemplate.htmlPart
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      res.json({
        success: true,
        message: 'Verification email sent successfully',
        emailSent
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while resending verification email'
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

  // Email verification endpoint
  app.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Find baker by verification token
      const baker = await databaseStorage.getBakerByVerificationToken(token);
      if (!baker) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      // Check if token has expired
      if (databaseStorage.isVerificationTokenExpired(baker)) {
        return res.status(400).json({
          success: false,
          message: 'Verification token has expired. Please request a new verification email.',
          requiresNewToken: true
        });
      }

      if (baker.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email already verified'
        });
      }

      // Mark email as verified and clear verification token
      await databaseStorage.updateBaker(baker.id, {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      });

      res.json({
        success: true,
        message: 'Email verified successfully! You can now log in to your account.',
        baker: {
          name: baker.name,
          email: baker.email,
          emailVerified: true
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during verification'
      });
    }
  });

  // Resend verification email endpoint
  app.post('/api/bakers/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Find baker by email
      const baker = await databaseStorage.getBakerByEmail(email);
      if (!baker) {
        return res.status(400).json({
          success: false,
          message: 'No account found with this email'
        });
      }

      if (baker.emailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;

      // Update baker with new verification token
      await databaseStorage.updateBaker(baker.id, {
        verificationToken
      });

      // Send verification email
      try {
        const emailTemplate = emailTemplates.emailVerification(baker.name, verificationUrl);
        await sendEmail({
          to: email,
          toName: baker.name,
          subject: emailTemplate.subject,
          textPart: emailTemplate.textPart,
          htmlPart: emailTemplate.htmlPart
        });

        res.json({
          success: true,
          message: 'Verification email sent! Please check your email.'
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.'
        });
      }

    } catch (error) {
      console.error('Resend verification error:', error);
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