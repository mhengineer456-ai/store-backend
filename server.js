import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import {
  initDb,
  getUserByEmail,
  getUserById,
  createUser,
  verifyUserOtp,
  updateUserOtp,
  getAllDesigns,
  createDesign,
  updateDesignStatus,
  getAllMaterials,
  upsertMaterial,
  deleteMaterial,
  getAllApprovalRequests,
  createApprovalRequest,
  updateApprovalRequestStatus,
  getAllPOs,
  createPO,
  updatePOStatus,
  getPOByNumberOrId,
  getAllVendors,
  createVendor,
  deleteVendor,
  getSetting,
  setSetting,
  getAllIssueLogs,
  createIssueLog,
  getCuttingMatrixByLot,
  createHistoryEntry,
  getAllHistory,
  getDesignById,
  createScanEntry,
  getAllScans,
  getAllCuttingHeaders,
  getAllDooriOrders,
  updateCuttingHeaderPayload,
  updateDooriPayload
} from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, 'cache');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Automatic cache size management configurations
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500 MB limit
const TARGET_CACHE_SIZE = 350 * 1024 * 1024; // Clean down to 350 MB

const autoCleanCache = () => {
  fs.readdir(CACHE_DIR, (err, files) => {
    if (err) return console.error('Cache directory read error:', err.message);

    const fileDetails = [];
    let totalSize = 0;

    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        fileDetails.push({ path: filePath, size: stats.size, mtime: stats.mtime });
        totalSize += stats.size;
      } catch (statErr) {
        console.error('Stat error for file:', filePath, statErr.message);
      }
    });

    if (totalSize <= MAX_CACHE_SIZE) return;

    console.log(`[Cache Monitor] Cache size (${(totalSize / 1024 / 1024).toFixed(2)} MB) exceeds 500MB limit. Starting cleanup...`);

    // Sort files by modification time (oldest first)
    fileDetails.sort((a, b) => a.mtime - b.mtime);

    let sizeFreed = 0;
    for (const file of fileDetails) {
      try {
        fs.unlinkSync(file.path);
        totalSize -= file.size;
        sizeFreed += file.size;
        if (totalSize <= TARGET_CACHE_SIZE) break;
      } catch (delErr) {
        console.error('Failed to delete cache file:', file.path, delErr.message);
      }
    }
    console.log(`[Cache Monitor] Cleanup completed. Freed ${(sizeFreed / 1024 / 1024).toFixed(2)} MB.`);
  });
};


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_gpdms_key_for_jwt_session_validation_2026';

app.use(cors());
app.use(express.json());

// Initialize Database
try {
  await initDb();
  console.log('Database initialized successfully.');
} catch (err) {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
}

// Mail Transporter Configuration
const getTransporter = () => {
  // If SMTP_SERVICE is set to gmail or if user entered credentials without host, default to Gmail service config
  if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_HOST)) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Custom SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

// Send OTP function
const sendOtpEmail = async (email, name, otpCode) => {
  const transporter = getTransporter();

  if (transporter) {
    try {
      await transporter.sendMail({
        from: '"G-PDMS Secure" <noreply@gpdms.com>',
        to: email,
        subject: 'G-PDMS Account Verification Code',
        text: `Hello ${name},\n\nYour G-PDMS verification code is ${otpCode}. It will expire in 10 minutes.\n\nBest regards,\nG-PDMS Team`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
          <h2 style="color: #4f46e5; margin-bottom: 20px;">G-PDMS Email Verification</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your one-time verification code is:</p>
          <div style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #4f46e5; background-color: #f1f5f9; padding: 12px; border-radius: 6px; margin: 24px 0;">
            ${otpCode}
          </div>
          <p>This code is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 24px;" />
          <p style="font-size: 12px; color: #64748b;">G-PDMS Secure Systems</p>
        </div>`
      });
      console.log(`Email successfully sent to ${email} with OTP ${otpCode}`);
      return true;
    } catch (mailErr) {
      console.error('SMTP Mail error occurred, falling back to console logging:', mailErr.message);
    }
  }

  // Fallback: Console logs
  console.log('\n========================================================================');
  console.log(`📧 SIMULATED EMAIL NOTIFICATION`);
  console.log(`TO: ${email}`);
  console.log(`SUBJECT: G-PDMS Account Verification OTP`);
  console.log(`CODE: ${otpCode}`);
  console.log('========================================================================\n');
  return false;
};

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION API ROUTES ---

// 1. User Registration Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Admin role requires secret code validation
    if (role === 'Admin') {
      const expectedCode = process.env.ADMIN_SECRET_CODE;
      if (!adminCode || adminCode.trim() !== expectedCode) {
        return res.status(403).json({ error: 'Invalid Admin Secret Code. Contact your system administrator.' });
      }
    }

    // Check if user exists
    const userExists = await getUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // OTP Details
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    // Save in DB
    await createUser(name, email, hashedPassword, role, otpCode, otpExpires);

    // Send OTP (real or simulated log)
    const isRealEmailSent = await sendOtpEmail(email, name, otpCode);

    res.status(201).json({
      message: 'Registration successful! Verification code sent.',
      email,
      simulatedOtp: isRealEmailSent ? null : otpCode // send to front-end for visual toast if SMTP is offline
    });
  } catch (err) {
    console.error('Registration API Error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// 2. Verify OTP Route
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'User account not found.' });
    }

    if (user.verified === 1) {
      return res.status(400).json({ error: 'Account is already verified.' });
    }

    if (!user.otp_code || user.otp_code !== otpCode) {
      return res.status(400).json({ error: 'Invalid verification OTP code.' });
    }

    // Check expiry
    const now = new Date();
    const expiry = new Date(user.otp_expires);
    if (now > expiry) {
      return res.status(400).json({ error: 'Verification code has expired.' });
    }

    // Set verified
    await verifyUserOtp(email);

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verify OTP API Error:', err.message);
    res.status(500).json({ error: 'Server error during OTP verification.' });
  }
});

// 3. Resend OTP Route
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'User account not found.' });
    }

    if (user.verified === 1) {
      return res.status(400).json({ error: 'Account is already verified.' });
    }

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await updateUserOtp(email, otpCode, otpExpires);
    const isRealEmailSent = await sendOtpEmail(email, user.name, otpCode);

    res.status(200).json({
      message: 'New verification code sent successfully.',
      simulatedOtp: isRealEmailSent ? null : otpCode
    });
  } catch (err) {
    console.error('Resend OTP API Error:', err.message);
    res.status(500).json({ error: 'Server error while resending verification code.' });
  }
});

// 4. User Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Check OTP verification status
    if (user.verified === 0) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        notVerified: true
      });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login API Error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// 5. Retrieve Current User Profile Route
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error('Get Profile API Error:', err.message);
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
});

// Helper: Robust CSV Parser (handles newlines inside quotes and double quote escaping)
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  const cleanText = text.replace(/\r\n/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];

    if (char === '"') {
      if (inQuotes && cleanText[i + 1] === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentVal);
      rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    rows.push(currentRow);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(h => h.trim());
  const results = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length === 1 && values[0] === '') continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index].trim() : '';
    });
    results.push(row);
  }

  return results;
}

// Helper: Get Lots CSV with local caching and offline fallback
const LOTS_CSV_CACHE_PATH = path.join(CACHE_DIR, 'lots.csv');
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL to keep data fresh but protect from rate limits

let lastFetchTime = 0;

async function getLotsCSV() {
  const url = 'https://docs.google.com/spreadsheets/d/13ArpFOD7idmpv7QIRJQkD-tfswtkH6rNnEANtv2M7Ek/export?format=csv&gid=0';
  const now = Date.now();
  const cacheExists = fs.existsSync(LOTS_CSV_CACHE_PATH);

  // If cache is fresh, serve it directly
  if (cacheExists && (now - lastFetchTime < CACHE_TTL_MS)) {
    return fs.readFileSync(LOTS_CSV_CACHE_PATH, 'utf8');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Sheets export failed with status ${response.status}: ${response.statusText}`);
    }
    const csvText = await response.text();

    // Save to disk cache
    fs.writeFileSync(LOTS_CSV_CACHE_PATH, csvText, 'utf8');
    lastFetchTime = now;
    return csvText;
  } catch (err) {
    console.error('[Cache Loader] Google Sheet fetch error:', err.message);

    // Offline fallback: Serve stale cache if available
    if (cacheExists) {
      console.warn('[Offline Fallback] Serving stale cached CSV.');
      return fs.readFileSync(LOTS_CSV_CACHE_PATH, 'utf8');
    }
    throw err;
  }
}

// 6. Retrieve Lot Data from Google Sheet Route
app.get('/api/lot/:lotNo', async (req, res) => {
  try {
    const lotNo = req.params.lotNo.trim();
    if (!lotNo) {
      return res.status(400).json({ error: 'Lot number parameter is required.' });
    }

    console.log(`Fetching Google Sheet data for lot: ${lotNo}...`);
    const csvText = await getLotsCSV();
    const rows = parseCSV(csvText);

    const matchedRow = rows.find(row => {
      const rowLotNo = row['Lot Number'] || row['Lot No'] || row['Job Order No'];
      return rowLotNo && String(rowLotNo).trim().toLowerCase() === lotNo.toLowerCase();
    });

    if (!matchedRow) {
      console.log(`Lot not found in sheet: ${lotNo}`);
      return res.status(404).json({ error: `Lot number "${lotNo}" not found in Google Sheet.` });
    }

    console.log(`Successfully matched lot: ${lotNo}`);
    res.status(200).json({
      lotNo: matchedRow['Lot Number'] || matchedRow['Lot No'] || matchedRow['Job Order No'] || lotNo,
      fabric: matchedRow['Fabric'] || '',
      brand: matchedRow['Brand'] || '',
      garmentType: matchedRow['Garment Type'] || '',
      section: matchedRow['Section'] || '',
      season: matchedRow['Season'] || '',
      style: matchedRow['Style'] || '',
      component: matchedRow['Component'] || matchedRow['Component '] || '',
      tapeLace: matchedRow['Tape/Lace'] || '',
      bottomType: matchedRow['Bottom Type'] || '',
      zip: matchedRow['Zip'] || '',
      sticker: matchedRow['Sticker'] || '',
      collar: matchedRow['Collar'] || '',
      bone: matchedRow['Bone'] || '',
      fullBaju: matchedRow['FULL BAJU'] || matchedRow['Full Baju'] || '',
      shade: matchedRow['Shade'] || '',
      size: matchedRow['Size'] || '',
      quantity: matchedRow['Quantity'] || '',
      unit: matchedRow['Unit'] || '',
      partyName: matchedRow['Party Name'] || '',
      emb: matchedRow['Emb'] || '',
      embDetails: matchedRow['Emb Details'] || '',
      printing: matchedRow['Printing'] || '',
      printingDetails: matchedRow['Printing Details'] || '',
      pattern: matchedRow['Pattern'] || '',
      remarks: matchedRow['Remarks'] || '',
      directStitching: matchedRow['Direct Stitching'] || '',
      submittedBy: matchedRow['Submitted By'] || '',
      imageUrl: matchedRow['Image URL'] || '',
      priority: matchedRow['Priority'] || '',
      status: matchedRow['Status'] || ''
    });
  } catch (err) {
    console.error('Google Sheet Lot Fetch Error:', err.message);
    res.status(500).json({ error: 'Server failed to retrieve Google Sheet data. Please check internet connection.' });
  }
});

// 7. Retrieve All Lot Synced Options from Google Sheet
app.get('/api/lots', async (req, res) => {
  try {
    console.log('Fetching Google Sheet data for all lots...');
    const csvText = await getLotsCSV();
    const rows = parseCSV(csvText);

    const lots = rows.map(row => {
      const lotNoVal = row['Lot Number'] || row['Lot No'] || row['Job Order No'] || '';
      return {
        lotNo: lotNoVal.trim(),
        itemName: row['Garment Type'] || row['Style'] || 'Unknown Item'
      };
    }).filter(item => item.lotNo);

    res.status(200).json(lots);
  } catch (err) {
    console.error('Google Sheet All Lots Fetch Error:', err.message);
    res.status(500).json({ error: 'Server failed to retrieve Google Sheet lots.' });
  }
});

// 8. Image Proxy to cache Google Drive images and avoid 429 Rate Limit errors
app.get('/api/image-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL query parameter is required.' });
    }

    // Extract Google Drive File ID
    let fileId = '';
    const fileDMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    const idParamMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      fileId = fileDMatch[1];
    } else if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }

    if (!fileId) {
      // If it's not a Google Drive link, redirect directly to it
      return res.redirect(imageUrl);
    }

    const cachePath = path.join(CACHE_DIR, `${fileId}`);

    // Check if the image is cached locally
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      return fs.createReadStream(cachePath).pipe(res);
    }

    // Otherwise, fetch it from Google Drive, write to local cache, and serve it
    const driveUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    console.log(`Image proxy fetching and caching Google Drive ID: ${fileId}...`);

    const response = await fetch(driveUrl);
    if (!response.ok) {
      throw new Error(`Google Drive returned status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save in cache folder asynchronously
    fs.writeFile(cachePath, buffer, (err) => {
      if (err) {
        console.error(`Failed to write cache file for ${fileId}:`, err.message);
      } else {
        console.log(`Successfully cached file ${fileId}`);
        autoCleanCache(); // Check and clean old files if cache size limit is exceeded
      }
    });

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.end(buffer);

  } catch (err) {
    console.error('Image Proxy Error:', err.message);
    // Redirect to original URL as a final fallback
    res.redirect(req.query.url);
  }
});

// GET all designs from SQLite/MySQL
app.get('/api/designs', async (req, res) => {
  try {
    const designs = await getAllDesigns();
    const parsed = designs.map(d => ({
      ...d,
      bom: typeof d.bom === 'string' ? JSON.parse(d.bom) : d.bom
    }));
    res.status(200).json(parsed);
  } catch (err) {
    console.error('API GET /api/designs error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve designs.' });
  }
});

// POST save/insert design to SQLite/MySQL
app.post('/api/designs', async (req, res) => {
  try {
    const design = { ...req.body };
    const actorName = design.actorName || 'Designer';
    delete design.actorName;

    const serialized = {
      ...design,
      bom: typeof design.bom === 'object' ? JSON.stringify(design.bom) : design.bom
    };
    await createDesign(serialized);
    await createHistoryEntry(design.id, 'created', actorName, `Lot created with category ${design.category || 'N/A'}, style ${design.style || 'N/A'}`);

    // Automatically create a pending design_verification approval request
    if (design.status === 'In Verification') {
      const formattedTime = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      await createApprovalRequest({
        id: `AR${Date.now()}`,
        type: 'design_verification',
        status: 'pending',
        requesterName: actorName,
        requesterRole: 'Designer',
        date: formattedTime,
        lotId: design.id,
        pieces: design.quantity || 100,
        reason: `Design Submission: Style ${design.style || 'N/A'} - Category ${design.category || 'N/A'}`
      });
    }

    res.status(201).json({ message: 'Design saved successfully.', design });
  } catch (err) {
    console.error('API POST /api/designs error:', err.message);
    res.status(500).json({ error: 'Failed to save design.' });
  }
});

// PUT update design verification status in SQLite/MySQL
app.put('/api/designs/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments, actorName } = req.body;
    await updateDesignStatus(id, status, comments || '');

    const action = status === 'Approved' ? 'approved' : 'rejected';
    await createHistoryEntry(id, action, actorName || 'Admin', comments || '');

    res.status(200).json({ message: 'Design status updated successfully.' });
  } catch (err) {
    console.error('API PUT /api/designs/:id/status error:', err.message);
    res.status(500).json({ error: 'Failed to update status.' });
  }
});

// GET all design history logs
app.get('/api/design-history', async (req, res) => {
  try {
    const history = await getAllHistory();
    res.status(200).json(history);
  } catch (err) {
    console.error('API GET /api/design-history error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve history logs.' });
  }
});

// ── Materials Routes ─────────────────────────────────────────────────────────

// GET all materials
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await getAllMaterials();
    res.status(200).json(materials);
  } catch (err) {
    console.error('API GET /api/materials error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve materials.' });
  }
});

// POST add new material
app.post('/api/materials', async (req, res) => {
  try {
    const m = req.body;
    await upsertMaterial(m);
    res.status(201).json({ message: 'Material saved successfully.', material: m });
  } catch (err) {
    console.error('API POST /api/materials error:', err.message);
    res.status(500).json({ error: 'Failed to save material.' });
  }
});

// PUT update a material (stock, cost, etc.)
app.put('/api/materials/:id', async (req, res) => {
  try {
    const m = { ...req.body, id: req.params.id };
    await upsertMaterial(m);
    res.status(200).json({ message: 'Material updated successfully.' });
  } catch (err) {
    console.error('API PUT /api/materials/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update material.' });
  }
});

// DELETE a material
app.delete('/api/materials/:id', async (req, res) => {
  try {
    await deleteMaterial(req.params.id);
    res.status(200).json({ message: 'Material deleted successfully.' });
  } catch (err) {
    console.error('API DELETE /api/materials/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete material.' });
  }
});

// ── Approval Request Routes ───────────────────────────────────────────────────

// GET all approval requests
app.get('/api/approval-requests', async (req, res) => {
  try {
    const requests = await getAllApprovalRequests();
    res.status(200).json(requests);
  } catch (err) {
    console.error('API GET /api/approval-requests error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve approval requests.' });
  }
});

// POST create new approval request
app.post('/api/approval-requests', async (req, res) => {
  try {
    const req_data = req.body;
    await createApprovalRequest(req_data);
    res.status(201).json({ message: 'Approval request submitted.', request: req_data });
  } catch (err) {
    console.error('API POST /api/approval-requests error:', err.message);
    res.status(500).json({ error: 'Failed to submit approval request.' });
  }
});

// PUT approve or reject an approval request
app.put('/api/approval-requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, resolvedDate: bodyResolvedDate } = req.body;
    const resolvedDate = bodyResolvedDate || new Date().toLocaleDateString('en-GB');
    await updateApprovalRequestStatus(id, status, { rejectionReason: rejectionReason || '', resolvedDate });
    res.status(200).json({ message: 'Approval request status updated.' });
  } catch (err) {
    console.error('API PUT /api/approval-requests/:id/status error:', err.message);
    res.status(500).json({ error: 'Failed to update approval request.' });
  }
});

// ── Purchase Order Routes ───────────────────────────────────────────────────

// GET all purchase orders
app.get('/api/pos', async (req, res) => {
  try {
    const pos = await getAllPOs();
    res.status(200).json(pos);
  } catch (err) {
    console.error('API GET /api/pos error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve purchase orders.' });
  }
});

// POST create new purchase order
app.post('/api/pos', async (req, res) => {
  try {
    const po = req.body;
    await createPO(po);
    res.status(201).json({ message: 'Purchase order saved.', po });
  } catch (err) {
    console.error('API POST /api/pos error:', err.message);
    res.status(500).json({ error: 'Failed to save purchase order.' });
  }
});

// PUT update PO status
app.put('/api/pos/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await updatePOStatus(req.params.id, status);
    res.status(200).json({ message: 'PO status updated.' });
  } catch (err) {
    console.error('API PUT /api/pos/:id/status error:', err.message);
    res.status(500).json({ error: 'Failed to update PO status.' });
  }
});

// PUT save Zip PO payload in cutting_header
app.put('/api/cutting-headers/:lotNo/payload', async (req, res) => {
  try {
    const { lotNo } = req.params;
    const { zip_payload } = req.body;
    await updateCuttingHeaderPayload(lotNo, zip_payload);
    res.status(200).json({ message: 'Zip PO payload updated.' });
  } catch (err) {
    console.error('API PUT /api/cutting-headers/:lotNo/payload error:', err.message);
    res.status(500).json({ error: 'Failed to update Zip PO payload.' });
  }
});

// PUT save Doori PO payload in doori
app.put('/api/doori-orders/:lotNo/payload', async (req, res) => {
  try {
    const { lotNo } = req.params;
    await updateDooriPayload(lotNo, req.body);
    res.status(200).json({ message: 'Doori PO payload updated.' });
  } catch (err) {
    console.error('API PUT /api/doori-orders/:lotNo/payload error:', err.message);
    res.status(500).json({ error: 'Failed to update Doori PO payload.' });
  }
});

// ── Vendor Routes ───────────────────────────────────────────────────────────

// GET all vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const vendors = await getAllVendors();
    res.status(200).json(vendors);
  } catch (err) {
    console.error('API GET /api/vendors error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve vendors.' });
  }
});

// POST add a vendor
app.post('/api/vendors', async (req, res) => {
  try {
    await createVendor(req.body);
    res.status(201).json({ message: 'Vendor saved.', vendor: req.body });
  } catch (err) {
    console.error('API POST /api/vendors error:', err.message);
    res.status(500).json({ error: 'Failed to save vendor.' });
  }
});

// DELETE a vendor
app.delete('/api/vendors/:id', async (req, res) => {
  try {
    await deleteVendor(req.params.id);
    res.status(200).json({ message: 'Vendor deleted.' });
  } catch (err) {
    console.error('API DELETE /api/vendors/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete vendor.' });
  }
});

// ── Settings Routes (accessories & designers lists) ─────────────────────────

// GET all settings (accessories_list + designers_list)
app.get('/api/settings', async (req, res) => {
  try {
    const accessoriesList = await getSetting('accessories_list');
    const designersList = await getSetting('designers_list');
    res.status(200).json({ accessoriesList, designersList });
  } catch (err) {
    console.error('API GET /api/settings error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve settings.' });
  }
});

// PUT update a setting by key
app.put('/api/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    await setSetting(key, value);
    res.status(200).json({ message: `Setting "${key}" updated.` });
  } catch (err) {
    console.error('API PUT /api/settings/:key error:', err.message);
    res.status(500).json({ error: 'Failed to update setting.' });
  }
});

// ── Issue Log Routes ────────────────────────────────────────────────────────

// GET all material issue/return logs
app.get('/api/issue-logs', async (req, res) => {
  try {
    const logs = await getAllIssueLogs();
    res.status(200).json(logs);
  } catch (err) {
    console.error('API GET /api/issue-logs error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve issue logs.' });
  }
});

// POST save a new issue/return log entry
app.post('/api/issue-logs', async (req, res) => {
  try {
    await createIssueLog(req.body);
    res.status(201).json({ message: 'Issue log saved.' });
  } catch (err) {
    console.error('API POST /api/issue-logs error:', err.message);
    res.status(500).json({ error: 'Failed to save issue log.' });
  }
});

// GET cutting matrix and header data by lot number
app.get('/api/cutting/:lotNo', async (req, res) => {
  try {
    const lotNo = req.params.lotNo;
    const result = await getCuttingMatrixByLot(lotNo);
    if (!result) {
      return res.status(404).json({ error: `Lot ${lotNo} not found.` });
    }
    res.status(200).json(result);
  } catch (err) {
    console.error('API GET /api/cutting/:lotNo error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve cutting matrix.' });
  }
});

// ── Scanner API Endpoints ───────────────────────────────────────────────────

// POST a new scanned entry (unauthenticated, so mobile scans work directly)
app.post('/api/scans', async (req, res) => {
  try {
    const { lot_number, scan_type, person_name, material_name, quantity, supplier_name, rgp_payload } = req.body;
    if (!person_name || !material_name || !supplier_name || (scan_type !== 'gate_entry' && !quantity)) {
      return res.status(400).json({ error: 'Person, material, quantity, and supplier are required.' });
    }
    await createScanEntry({
      lot_number,
      scan_type,
      person_name,
      material_name,
      quantity,
      supplier_name,
      rgp_payload
    });
    res.status(201).json({ message: 'Scan entry saved successfully!' });
  } catch (err) {
    console.error('API POST /api/scans error:', err.message);
    res.status(500).json({ error: 'Failed to save scanned entry.' });
  }
});

// GET all scans (for logs dashboard)
app.get('/api/scans', async (req, res) => {
  try {
    const scans = await getAllScans();
    res.status(200).json(scans);
  } catch (err) {
    console.error('API GET /api/scans error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve scanned logs.' });
  }
});

// GET design by ID publicly (for barcode scanner form prefilling)
app.get('/api/public/lot/:lotNo', async (req, res) => {
  try {
    const lotNo = req.params.lotNo;
    const design = await getDesignById(lotNo);
    if (!design) {
      // Check if it is a Purchase Order
      const po = await getPOByNumberOrId(lotNo);
      if (po) {
        const totalQty = po.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
        return res.status(200).json({
          id: po.poNumber,
          name: po.designName || 'Purchase Order',
          bom: po.items.map(item => ({
            name: item.name,
            description: item.name,
            status: 'Yes',
            detail: String(item.qty)
          })),
          brand: po.vendorName,
          category: po.designCategory || 'N/A',
          style: po.poNumber,
          quantity: totalQty,
          date: po.date
        });
      }
      return res.status(404).json({ error: `Design Lot or PO ${lotNo} not found in database.` });
    }
    res.status(200).json({
      id: design.id,
      name: design.name,
      bom: typeof design.bom === 'string' ? JSON.parse(design.bom) : design.bom,
      brand: design.brand,
      category: design.category,
      style: design.style,
      quantity: design.quantity,
      date: design.date
    });
  } catch (err) {
    console.error('API GET /api/public/lot/:lotNo error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve public design/PO info.' });
  }
});

// GET local network IP of the server publicly (so frontend can build accessible QR code URLs)
app.get('/api/public/server-ip', (req, res) => {
  try {
    const interfaces = os.networkInterfaces();
    let localIp = 'localhost';
    for (const interfaceName in interfaces) {
      const addresses = interfaces[interfaceName];
      for (const address of addresses) {
        // Exclude loopback/internal addresses and filter for IPv4
        if (address.family === 'IPv4' && !address.internal) {
          localIp = address.address;
          break;
        }
      }
      if (localIp !== 'localhost') break;
    }
    res.status(200).json({ ip: localIp });
  } catch (err) {
    console.error('API GET /api/public/server-ip error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve server local IP.' });
  }
});

// GET all cutting headers (Zip POs) from database
app.get('/api/cutting-headers', async (req, res) => {
  try {
    const headers = await getAllCuttingHeaders();
    res.status(200).json(headers);
  } catch (err) {
    console.error('API GET /api/cutting-headers error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve cutting headers.' });
  }
});

// GET all doori orders (Dori POs) from database
app.get('/api/doori-orders', async (req, res) => {
  try {
    const orders = await getAllDooriOrders();
    res.status(200).json(orders);
  } catch (err) {
    console.error('API GET /api/doori-orders error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve doori orders.' });
  }
});

// Serve static assets in production (if built)
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
const server = app.listen(PORT, () => {
  console.log(`G-PDMS Auth Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${PORT} is already in use.`);
    console.error(`To automatically kill the process on port ${PORT} in PowerShell, run:\n`);
    console.error(`    Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force\n`);
    process.exit(1);
  } else {
    throw err;
  }
});

