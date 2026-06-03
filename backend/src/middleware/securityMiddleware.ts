import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import crypto from 'crypto';

export interface SecurityConfig {
  enableHelmet?: boolean;
  enableCors?: boolean;
  enableRateLimit?: boolean;
  enableSanitization?: boolean;
  enableHpp?: boolean;
  enableCsrf?: boolean;
  enableRequestId?: boolean;
  logRequests?: boolean;
}

const defaultConfig: SecurityConfig = {
  enableHelmet: true,
  enableCors: true,
  enableRateLimit: true,
  enableSanitization: true,
  enableHpp: true,
  enableCsrf: true,
  enableRequestId: true,
  logRequests: true,
};

// Generate unique request ID for tracking
const generateRequestId = () => crypto.randomUUID();

// CORS configuration
const corsOptions = {
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
};

// Rate limiting configurations
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict limit for auth endpoints
  message: 'Too many login/signup attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // limit each IP to 1000 requests per hour
  message: 'API rate limit exceeded',
});

// Custom middleware for security headers
const securityHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
  );
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  next();
};

// Request ID middleware
const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  (req as any).id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Logging middleware
const requestLogger = morgan((tokens, req, res) => {
  return [
    tokens.date(req, res, 'iso'),
    `[${(req as any).id}]`,
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res),
    'ms',
    tokens['res'](req, res, 'content-length'),
  ].join(' ');
}, {
  skip: (req) => process.env.NODE_ENV === 'test',
});

// Input validation middleware
const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Validate JSON payload size
  if (req.method !== 'GET' && req.get('content-type')?.includes('application/json')) {
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({
        success: false,
        message: 'Payload too large',
      });
    }
  }
  
  next();
};

// Authentication token validation
const validateAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue to auth middleware for proper validation
  }
  
  const token = authHeader.slice(7);
  
  // Basic token format validation
  if (token.length < 10 || token.length > 1000) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token format',
    });
  }
  
  next();
};

// SQL Injection prevention (for raw queries)
const preventSQLInjection = (req: Request, res: Response, next: NextFunction) => {
  // Dangerous patterns to detect
  const dangerousPatterns = [
    /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT)\b)/gi,
    /(-{2}|\/\*|\*\/|xp_|sp_)/,
  ];
  
  const checkString = (str: any): boolean => {
    if (typeof str !== 'string') return false;
    return dangerousPatterns.some(pattern => pattern.test(str));
  };
  
  // Check query parameters
  for (const key in req.query) {
    if (checkString(req.query[key])) {
      console.warn(`Potential SQL injection attempt detected in query: ${key}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid input detected',
      });
    }
  }
  
  next();
};

// Data exposure prevention
const preventDataExposure = (req: Request, res: Response, next: NextFunction) => {
  // Override json method to sanitize response
  const originalJson = res.json.bind(res);
  
  res.json = function(data: any) {
    // Remove sensitive fields from response
    const sanitize = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      if (obj !== null && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          // Remove password, tokens, secrets
          if (/^(password|token|secret|apiKey|key_secret|refreshToken)$/i.test(key)) {
            continue;
          }
          sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
      }
      
      return obj;
    };
    
    return originalJson(sanitize(data));
  };
  
  next();
};

// Apply security middleware
export function applySecurityMiddleware(app: Express, config: SecurityConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  
  console.log('🔒 Applying security middleware...');
  
  // Request tracking
  if (finalConfig.enableRequestId) {
    app.use(requestIdMiddleware);
    console.log('✓ Request ID middleware enabled');
  }
  
  // Logging
  if (finalConfig.logRequests) {
    app.use(requestLogger);
  }
  
  // Helmet for HTTP headers security
  if (finalConfig.enableHelmet) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https:'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }));
    console.log('✓ Helmet middleware enabled');
  }
  
  // CORS
  if (finalConfig.enableCors) {
    app.use(cors(corsOptions));
    console.log('✓ CORS middleware enabled');
  }
  
  // Rate limiting
  if (finalConfig.enableRateLimit) {
    app.use('/api/', generalLimiter);
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/signup', authLimiter);
    console.log('✓ Rate limiting enabled');
  }
  
  // Data sanitization
  if (finalConfig.enableSanitization) {
    app.use(mongoSanitize()); // Remove $ and . from object keys
    console.log('✓ Data sanitization enabled');
  }
  
  // Prevent HTTP Parameter Pollution
  if (finalConfig.enableHpp) {
    app.use(hpp()); // Use the last value for duplicate query parameters
    console.log('✓ HPP middleware enabled');
  }
  
  // Custom security headers
  app.use(securityHeadersMiddleware);
  
  // Request ID
  app.use(requestIdMiddleware);
  
  // Input validation
  app.use(inputValidationMiddleware);
  
  // Auth token validation
  app.use(validateAuthToken);
  
  // SQL injection prevention
  app.use(preventSQLInjection);
  
  // Data exposure prevention
  app.use(preventDataExposure);
  
  console.log('🔒 Security middleware applied successfully\n');
}

// Export middleware functions for selective usage
export {
  generalLimiter,
  authLimiter,
  apiLimiter,
  securityHeadersMiddleware,
  requestIdMiddleware,
  inputValidationMiddleware,
  validateAuthToken,
  preventSQLInjection,
  preventDataExposure,
};
