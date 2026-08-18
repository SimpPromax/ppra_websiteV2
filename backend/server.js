// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

// ============================================
// IMPORT QUEUE SYSTEMS
// ============================================
const { setupProxyRoutes } = require('./proxy');
const { InMemoryQueue } = require('./in-memory-queue');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE - CORS
// ============================================
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(origin => origin.trim().replace(/\/$/, ''))
  : ['http://localhost:5173', 'http://10.50.50.193:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.CLIENT_URL === '*') {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Cache-Control',
    'X-Requested-With',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['Content-Length', 'X-Cache', 'X-Cache-Age'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json());

// ============================================
// RATE LIMITING
// ============================================
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

const advisoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many advisory requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// SETUP PROXY ROUTES
// ============================================
setupProxyRoutes(app);

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

// ============================================
// EMAIL TRANSPORTER - FIXED
// ============================================
let transporter = null;
let emailReady = false;

// Function to initialize email transporter
async function initEmailTransporter() {
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials not configured in .env');
    console.error('   Please set SMTP_USER and SMTP_PASS');
    return false;
  }

  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // Verify the transporter - wait for it to complete
    await transporter.verify();
    console.log('✅ Email transporter ready');
    emailReady = true;
    return true;
  } catch (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('   Please check your SMTP credentials in .env');
    console.error('   SMTP_USER:', process.env.SMTP_USER);
    console.error('   SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set (hidden)' : '❌ Not set');
    emailReady = false;
    return false;
  }
}

// ============================================
// STAKEHOLDER TYPE MAP
// ============================================
const stakeholderMap = {
  'procuring-entity': 'Procuring Entity',
  'supplier': 'Supplier',
  'contractor': 'Contractor',
  'consultant': 'Consultant',
  'bidder': 'Bidder',
  'government': 'Government Institution',
  'development-partner': 'Development Partner',
  'public': 'Member of the Public',
  'other': 'Other'
};

// ============================================
// VALIDATION
// ============================================
const validateForm = (data) => {
  const errors = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push({ field: 'fullName', message: 'Full name is required (minimum 2 characters)' });
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!data.subject || data.subject.trim().length < 3) {
    errors.push({ field: 'subject', message: 'Subject is required (minimum 3 characters)' });
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  }

  return errors;
};

// ============================================
// SEND EMAIL FUNCTION
// ============================================
const sendAdvisoryEmail = async (formData, attachmentFile) => {
  // Check if email is configured
  if (!emailReady || !transporter) {
    console.error('❌ Email not configured. Skipping email send.');
    console.log('📧 Email would have been sent to:', process.env.INFO_EMAIL || 'info@ppra.go.ke');
    console.log('📧 From:', formData.email);
    console.log('📧 Subject:', formData.subject);
    return { 
      success: false, 
      error: 'Email service not configured',
      message: 'Email not sent - configuration issue'
    };
  }

  const { fullName, email, organization, stakeholderType, subject, message } = formData;
  const stakeholderDisplay = stakeholderMap[stakeholderType] || stakeholderType || 'Not specified';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #201444; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #fffdf5; border: 1px solid #e0e0e0; border-radius: 8px; }
        .header { background: #201444; padding: 20px; color: white; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #201444; display: block; margin-bottom: 5px; }
        .value { background: #f5f0e8; padding: 10px; border-radius: 4px; }
        .badge { display: inline-block; background: #3d2a6b; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
        .footer { text-align: center; padding: 20px 0 0 0; font-size: 12px; color: #666; border-top: 1px solid #e0e0e0; margin-top: 20px; }
        .next-steps { background: #f5f0e8; padding: 15px; border-radius: 4px; margin-top: 20px; }
        .attachment-info { background: #e8f0fe; padding: 10px; border-radius: 4px; margin-top: 10px; border-left: 3px solid #201444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📋 New Advisory Service Request</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Submitted via PPRA Website</p>
        </div>
        <div class="field">
          <span class="label">👤 Full Name</span>
          <div class="value">${fullName}</div>
        </div>
        <div class="field">
          <span class="label">📧 Email Address</span>
          <div class="value"><a href="mailto:${email}">${email}</a></div>
        </div>
        <div class="field">
          <span class="label">🏢 Organization</span>
          <div class="value">${organization || 'Not specified'}</div>
        </div>
        <div class="field">
          <span class="label">📌 Stakeholder Type</span>
          <div class="value"><span class="badge">${stakeholderDisplay}</span></div>
        </div>
        <div class="field">
          <span class="label">📝 Subject</span>
          <div class="value">${subject}</div>
        </div>
        <div class="field">
          <span class="label">💬 Message</span>
          <div class="value" style="white-space: pre-wrap;">${message}</div>
        </div>
        ${attachmentFile ? `
          <div class="attachment-info">
            <strong>📎 Attachment Included:</strong><br />
            File: ${attachmentFile.originalname}<br />
            Size: ${(attachmentFile.size / 1024).toFixed(1)} KB<br />
            Type: ${attachmentFile.mimetype}
          </div>
        ` : ''}
        <div class="next-steps">
          <strong>📌 Next Steps:</strong><br />
          1. Review the request and prepare advisory response.<br />
          2. Respond to the user at: <a href="mailto:${email}">${email}</a><br />
          3. After providing advice, send the Google Form feedback link to the user.<br />
          4. Feedback will be sent to <strong>advisory@ppra.go.ke</strong>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Public Procurement Regulatory Authority</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PPRA Website" <${process.env.SMTP_USER}>`,
    to: process.env.INFO_EMAIL || 'info@ppra.go.ke',
    subject: `Advisory Service Request: ${subject}`,
    html: htmlContent,
  };

  if (attachmentFile) {
    mailOptions.attachments = [
      {
        filename: attachmentFile.originalname,
        content: attachmentFile.buffer,
        contentType: attachmentFile.mimetype,
      },
    ];
  }

  try {
    console.log(`📧 Sending email to: ${mailOptions.to}`);
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email:`, error.message);
    throw error;
  }
};

// ============================================
// CREATE QUEUE
// ============================================
const memoryQueue = new InMemoryQueue(3);

// ============================================
// EMAIL QUEUE PROCESSOR
// ============================================
const processEmail = async (jobData) => {
  const { formData, attachmentFile } = jobData;
  console.log(`📧 [Queue] Processing email for: ${formData.email}`);
  
  try {
    const result = await sendAdvisoryEmail(formData, attachmentFile);
    console.log(`✅ [Queue] Email sent to: ${formData.email}`);
    return result;
  } catch (error) {
    console.error(`❌ [Queue] Failed to send email for ${formData.email}:`, error.message);
    throw error;
  }
};

// ============================================
// START QUEUE PROCESSOR
// ============================================
memoryQueue.startProcessing(processEmail);
console.log('🔄 Queue processor started with 3 workers');

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/cors-test - Test CORS configuration
 */
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working!',
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test-email - Test email configuration
 */
app.get('/api/test-email', async (req, res) => {
  try {
    const testData = {
      fullName: 'Test User',
      email: 'test@example.com',
      organization: 'Test Org',
      stakeholderType: 'public',
      subject: 'Test Email from API',
      message: 'This is a test email to verify the email configuration.'
    };
    
    console.log('📧 [Test] Sending test email...');
    const result = await sendAdvisoryEmail(testData, null);
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      result: result
    });
  } catch (error) {
    console.error('❌ [Test] Failed to send test email:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

/**
 * POST /api/advisory - Submit advisory request
 */
app.post('/api/advisory', 
  advisoryLimiter,
  upload.single('attachment'), 
  async (req, res) => {
    try {
      const formData = req.body;
      const attachmentFile = req.file;
      
      console.log(`📥 Received request from: ${formData.email}`);
      if (attachmentFile) {
        console.log(`📎 Attachment: ${attachmentFile.originalname} (${(attachmentFile.size / 1024).toFixed(1)} KB)`);
      }

      // Validate form data
      const errors = validateForm(formData);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: errors,
        });
      }

      // Add to queue
      const jobId = memoryQueue.add({
        formData,
        attachmentFile
      });

      console.log(`📋 Job ${jobId} queued for: ${formData.email}`);
      console.log(`📊 Queue status: Waiting: ${memoryQueue.getWaitingCount()}, Processing: ${memoryQueue.getProcessingCount()}`);

      // Respond immediately
      res.status(200).json({
        success: true,
        jobId: jobId,
        message: 'Your request has been received and is being processed. You will receive a response shortly.',
        queuePosition: memoryQueue.getWaitingCount(),
        estimatedWait: '1-2 minutes'
      });

    } catch (error) {
      console.error('❌ Error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to process request. Please try again or contact us directly.',
      });
    }
  }
);

/**
 * GET /api/advisory/queue-status - Check queue status
 */
app.get('/api/advisory/queue-status', (req, res) => {
  const status = {
    queueType: 'in-memory',
    waiting: memoryQueue.getWaitingCount(),
    processing: memoryQueue.getProcessingCount(),
    completed: memoryQueue.getCompletedCount(),
    failed: memoryQueue.getFailedCount(),
    timestamp: new Date().toISOString()
  };
  
  console.log('📊 Queue status:', status);
  res.json(status);
});

/**
 * GET /api/advisory/job/:id - Check specific job status
 */
app.get('/api/advisory/job/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = memoryQueue.getJob(jobId);
  
  if (!job) {
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  res.json({
    success: true,
    job: job
  });
});

/**
 * GET /api/advisory/health - Health check
 */
app.get('/api/advisory/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'PPRA Advisory Service',
    features: {
      attachments: {
        supported: 'PDF files only',
        maxSize: '10MB',
      },
      queue: {
        type: 'in-memory',
        maxConcurrency: 3,
        waiting: memoryQueue.getWaitingCount(),
        processing: memoryQueue.getProcessingCount()
      }
    },
  });
});

/**
 * GET / - Root API info
 */
app.get('/', (req, res) => {
  res.json({
    service: 'PPRA Advisory Service API',
    version: '2.0.0',
    features: {
      attachments: 'PDF files up to 10MB',
      proxy: 'CORS proxy for PPRA pages (streaming)',
      queue: 'In-memory queue for email processing'
    },
    endpoints: {
      '/api/advisory': {
        method: 'POST',
        description: 'Submit advisory request with optional PDF attachment',
        required_fields: ['fullName', 'email', 'subject', 'message'],
        optional_fields: ['organization', 'stakeholderType', 'attachment (PDF)'],
        note: 'Returns immediately, email sends in background'
      },
      '/api/advisory/queue-status': {
        method: 'GET',
        description: 'Check queue status'
      },
      '/api/advisory/job/:id': {
        method: 'GET',
        description: 'Check specific job status'
      },
      '/api/advisory/health': {
        method: 'GET',
        description: 'Health check endpoint',
      },
      '/api/proxy/arb-decisions': {
        method: 'GET',
        description: 'Proxy for ARB Decisions page (streaming)',
      },
      '/api/proxy/compliance-reports': {
        method: 'GET',
        description: 'Proxy for Compliance Reports page (streaming)',
      },
      '/api/proxy/ppra/:page': {
        method: 'GET',
        description: 'Generic proxy for any PPRA page (streaming)',
      },
      '/api/proxy/health': {
        method: 'GET',
        description: 'Proxy health check',
      },
      '/api/cors-test': {
        method: 'GET',
        description: 'Test CORS configuration',
      },
      '/api/test-email': {
        method: 'GET',
        description: 'Test email configuration',
      },
    },
  });
});

// ============================================
// INITIALIZE EMAIL AND START SERVER
// ============================================
async function startServer() {
  // Initialize email first
  await initEmailTransporter();
  
  // Start the server
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 PPRA Advisory Service Backend v2.0');
    console.log('='.repeat(50));
    console.log(`📍 Server: http://localhost:${PORT}`);
    console.log(`📧 Sending to: ${process.env.INFO_EMAIL || 'info@ppra.go.ke'}`);
    console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}`);
    console.log(`📎 Attachments: PDF only, max 10MB`);
    console.log(`🔄 Queue: In-memory (3 concurrent workers)`);
    console.log(`📧 Email: ${emailReady ? '✅ Ready' : '❌ Not configured'}`);
    console.log('='.repeat(50));
    console.log('📋 Available endpoints:');
    console.log(`   POST   /api/advisory              - Submit advisory request (queued)`);
    console.log(`   GET    /api/advisory/queue-status - Queue status`);
    console.log(`   GET    /api/advisory/job/:id      - Job status`);
    console.log(`   GET    /api/advisory/health       - Health check`);
    console.log(`   GET    /api/proxy/arb-decisions   - ARB Decisions proxy (streaming)`);
    console.log(`   GET    /api/proxy/compliance-reports - Compliance Reports proxy (streaming)`);
    console.log(`   GET    /api/proxy/ppra/:page      - Generic PPRA proxy (streaming)`);
    console.log(`   GET    /api/proxy/health          - Proxy health check`);
    console.log(`   GET    /api/cors-test             - CORS test endpoint`);
    console.log(`   GET    /api/test-email            - Test email configuration`);
    console.log(`   GET    /                          - API info`);
    console.log('='.repeat(50));
    console.log(`📊 Queue workers: 3 concurrent`);
    console.log(`⏱️  Response time: < 100ms (non-blocking)`);
    console.log('='.repeat(50));
  });
}

// Start the server
startServer();

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM. Shutting down gracefully...');
  memoryQueue.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT. Shutting down gracefully...');
  memoryQueue.shutdown();
  process.exit(0);
});