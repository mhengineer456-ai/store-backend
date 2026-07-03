import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// ── MySQL Connection Pool ──────────────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'newdata',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ── Seed Data ─────────────────────────────────────────────────────────────────

const initialMaterials = [
  { id: 'M1302', name: 'Organic Cotton Fabric Roll', category: 'Fabric', stock: 2400, unit: 'meters', cost: 25.00, threshold: 200, color: 'Pure White' },
  { id: 'M1303', name: 'Indigo Denim Raw Roll', category: 'Fabric', stock: 850, unit: 'meters', cost: 45.00, threshold: 150, color: 'Raw Deep Indigo' },
  { id: 'M1304', name: 'YKK Brass Zippers (15cm)', category: 'Trim', stock: 150, unit: 'pieces', cost: 2.50, threshold: 200, color: 'Matte Gold' },
  { id: 'M1305', name: 'Polyester Thread Spool', category: 'Trim', stock: 45, unit: 'rolls', cost: 8.00, threshold: 50, color: 'Neutral Gray' },
  { id: 'M1306', name: 'Metal Rivets (Pack of 100)', category: 'Trim', stock: 60, unit: 'pieces', cost: 5.00, threshold: 20, color: 'Silver Metallic' },
  { id: 'M1307', name: 'Printed Satin Brand Labels', category: 'Accessory', stock: 500, unit: 'pieces', cost: 0.80, threshold: 100, color: 'Glossy White' }
];

const initialDesigns = [
  {
    id: '11000', name: 'Summer Denim Jacket', lotNo2: 'MH-4458', brand: 'Zara',
    category: 'JACKET', designer: 'Sarah Connor', fabricType: 'Raw Denim Cotton 100%',
    targetSizes: 'S, M, L, XL', colorCode: '#1e40af', status: 'In Verification',
    date: '10/08/2023', comments: '', section: 'Men', season: 'Winter', style: 'ST-9921',
    tapeLace: 'No', bottomType: 'N/A', zip: 'Yes', sticker: 'No', collar: 'No', bone: 'No', fullBaju: 'No',
    bom: JSON.stringify([
      { name: 'Zip', status: 'Yes', detail: '1', description: 'YKK Brass Zippers (15cm)', materialId: 'M1304' },
      { name: 'Button', status: 'Yes', detail: '6', description: 'Metal Rivets (Pack of 100)', materialId: 'M1306' },
      { name: 'Elastic', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Tape / Lace', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Rib', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Collar', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Sticker / Label', status: 'Yes', detail: '1', description: 'Printed Satin Brand Labels', materialId: 'M1307' },
      { name: 'Thread', status: 'Yes', detail: '1', description: 'Polyester Thread Spool', materialId: 'M1305' },
      { name: 'Pocket', status: 'Yes', detail: '2', description: 'Chest pockets', materialId: '' },
      { name: 'Drawstring / Nara', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Hook, buckle, velcro', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Interlining / fusing', status: 'Yes', detail: '1', description: 'Placket fusing', materialId: '' }
    ]),
    totalCost: 0, imageUrl: ''
  },
  {
    id: '11001', name: 'Organic Cotton Polo Shirt', lotNo2: 'MH-4459', brand: 'Nike',
    category: 'T-SHIRT COLLAR', designer: 'Michael Scott', fabricType: 'Pima Cotton Pique',
    targetSizes: 'M, L, XL', colorCode: '#059669', status: 'Approved',
    date: '08/08/2023', comments: '', section: 'Men', season: 'Summer', style: 'TS-2201',
    tapeLace: 'No', bottomType: 'N/A', zip: 'No', sticker: 'No', collar: 'Yes', bone: 'No', fullBaju: 'No',
    bom: JSON.stringify([
      { name: 'Zip', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Button', status: 'Yes', detail: '3', description: 'Polo neck buttons', materialId: '' },
      { name: 'Elastic', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Tape / Lace', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Rib', status: 'Yes', detail: '2', description: 'Collar & cuff rib', materialId: '' },
      { name: 'Collar', status: 'Yes', detail: '1', description: 'Flat knit collar', materialId: '' },
      { name: 'Sticker / Label', status: 'Yes', detail: '1', description: 'Printed Satin Brand Labels', materialId: 'M1307' },
      { name: 'Thread', status: 'Yes', detail: '1', description: 'Polyester Thread Spool', materialId: 'M1305' },
      { name: 'Pocket', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Drawstring / Nara', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Hook, buckle, velcro', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Interlining / fusing', status: 'Yes', detail: '1', description: 'Collar stand fusing', materialId: '' }
    ]),
    totalCost: 0, imageUrl: ''
  },
  {
    id: '11002', name: 'Linen Comfort Trousers', lotNo2: 'MH-4460', brand: 'H&M',
    category: 'LOWER', designer: 'Sarah Connor', fabricType: 'Pure Linen Weave',
    targetSizes: 'S, M, L', colorCode: '#d97706', status: 'Approved',
    date: '02/08/2023', comments: '', section: 'Women', season: 'Summer', style: 'TR-3304',
    tapeLace: 'No', bottomType: 'Elastic mohri', zip: 'No', sticker: 'No', collar: 'No', bone: 'No', fullBaju: 'No',
    bom: JSON.stringify([
      { name: 'Zip', status: 'Yes', detail: '1', description: 'YKK Fly Zipper', materialId: '' },
      { name: 'Button', status: 'Yes', detail: '1', description: 'Waistband button', materialId: '' },
      { name: 'Elastic', status: 'Yes', detail: '1', description: 'Waistband elastic', materialId: '' },
      { name: 'Tape / Lace', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Rib', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Collar', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Sticker / Label', status: 'Yes', detail: '1', description: 'Brand Label', materialId: '' },
      { name: 'Thread', status: 'Yes', detail: '1', description: 'Polyester Thread Spool', materialId: 'M1305' },
      { name: 'Pocket', status: 'Yes', detail: '2', description: 'Side pockets', materialId: '' },
      { name: 'Drawstring / Nara', status: 'Yes', detail: '1', description: 'Waist drawstring', materialId: '' },
      { name: 'Hook, buckle, velcro', status: 'No', detail: '', description: '', materialId: '' },
      { name: 'Interlining / fusing', status: 'Yes', detail: '1', description: 'Waistband fusing', materialId: '' }
    ]),
    totalCost: 0, imageUrl: ''
  }
];

const initialPOs = [
  {
    id: 'PO1301', poNumber: 'PO-83421', vendorName: 'YKK Trim Solutions',
    vendorEmail: 'sales@ykk-trims.com', vendorAddress: 'Industrial Block C, Mumbai',
    designName: 'Summer Denim Jacket', designCategory: 'JACKET',
    items: JSON.stringify([
      { name: 'YKK Brass Zippers (15cm)', qty: 500, unit: 'pieces', price: 2.50 },
      { name: 'Metal Rivets (Pack of 100)', qty: 627, unit: 'pieces', price: 5.00 }
    ]),
    subtotal: 4385, taxRate: 18, tax: 789.3, total: 38500,
    date: '23/02/2023', deliveryDate: '15/03/2023', status: 'Sent to Vendor'
  }
];

const initialVendors = [
  { id: 'V101', name: 'YKK Trim Solutions', email: 'sales@ykk-trims.com', address: 'Industrial Block C, Mumbai', materialsJoined: 'Metal Buttons & Rivets' },
  { id: 'V102', name: 'EuroCotton Mills', email: 'orders@eurocotton.co', address: 'Textile Center Hub, Gujarat', materialsJoined: 'Fabrics & Yarn' },
  { id: 'V103', name: 'Global Tags & Trims', email: 'info@globaltags.com', address: 'Apparel Center Complex, Mumbai', materialsJoined: 'Labels, Tags & Hangers' }
];

const initialAccessories = [
  'Zip', 'Button', 'Elastic', 'Tape / Lace', 'Rib', 'Collar',
  'Sticker / Label', 'Thread', 'Pocket', 'Drawstring / Nara',
  'Hook, buckle, velcro', 'Interlining / fusing', 'Bone', 'Full Baju'
];

const initialDesigners = ['Sarah Connor', 'Michael Scott', 'Admin'];

// ── initDb: create tables + seed ──────────────────────────────────────────────

export async function initDb() {
  // Test connection on startup
  try {
    await pool.execute('SELECT 1');
    console.log('[DB] MySQL connected successfully.');
  } catch (err) {
    console.error('[DB] MySQL connection FAILED:', err.message);
    process.exit(1);
  }

  // Users
  await pool.execute(`CREATE TABLE IF NOT EXISTS users (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) UNIQUE NOT NULL,
    password     TEXT NOT NULL,
    role         VARCHAR(50) NOT NULL,
    verified     TINYINT DEFAULT 0,
    otp_code     VARCHAR(50),
    otp_expires  DATETIME,
    created_at   DATETIME
  )`);

  // Designs
  await pool.execute(`CREATE TABLE IF NOT EXISTS designs (
    id           VARCHAR(100) PRIMARY KEY,
    name         VARCHAR(255),
    lotNo2       VARCHAR(255),
    brand        VARCHAR(255),
    category     VARCHAR(255),
    designer     VARCHAR(255),
    fabricType   VARCHAR(255),
    targetSizes  VARCHAR(255),
    colorCode    VARCHAR(50),
    status       VARCHAR(100),
    date         VARCHAR(100),
    comments     TEXT,
    section      VARCHAR(100),
    season       VARCHAR(100),
    style        VARCHAR(100),
    tapeLace     VARCHAR(50),
    bottomType   VARCHAR(255),
    zip          VARCHAR(50),
    sticker      VARCHAR(50),
    collar       VARCHAR(50),
    bone         VARCHAR(50),
    fullBaju     VARCHAR(50),
    bom          TEXT,
    totalCost    DOUBLE DEFAULT 0,
    imageUrl     TEXT,
    quantity     INT DEFAULT 100
  )`);
  try { await pool.execute(`ALTER TABLE designs ADD COLUMN quantity INT DEFAULT 100`); } catch (_) { }
  try { await pool.execute(`ALTER TABLE designs ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`); } catch (_) { }

  // Materials
  await pool.execute(`CREATE TABLE IF NOT EXISTS materials (
    id         VARCHAR(100) PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100),
    stock      DOUBLE DEFAULT 0,
    unit       VARCHAR(50),
    cost       DOUBLE DEFAULT 0,
    threshold  DOUBLE DEFAULT 0,
    color      VARCHAR(100)
  )`);

  // Approval Requests
  await pool.execute(`CREATE TABLE IF NOT EXISTS approval_requests (
    id              VARCHAR(100) PRIMARY KEY,
    type            VARCHAR(100) NOT NULL,
    status          VARCHAR(50)  DEFAULT 'pending',
    requesterName   VARCHAR(255),
    requesterRole   VARCHAR(100),
    date            VARCHAR(100),
    lotId           VARCHAR(100),
    pieces          INT DEFAULT 0,
    personName      VARCHAR(255),
    isReissue       TINYINT DEFAULT 0,
    items           TEXT,
    materialId      VARCHAR(100),
    materialName    VARCHAR(255),
    reason          TEXT,
    rejectionReason TEXT,
    resolvedDate    VARCHAR(100)
  )`);

  // Purchase Orders
  await pool.execute(`CREATE TABLE IF NOT EXISTS purchase_orders (
    id              VARCHAR(100) PRIMARY KEY,
    poNumber        VARCHAR(100),
    vendorName      VARCHAR(255),
    vendorEmail     VARCHAR(255),
    vendorAddress   TEXT,
    designName      VARCHAR(255),
    designCategory  VARCHAR(100),
    items           TEXT,
    subtotal        DOUBLE DEFAULT 0,
    taxRate         DOUBLE DEFAULT 18,
    tax             DOUBLE DEFAULT 0,
    total           DOUBLE DEFAULT 0,
    date            VARCHAR(100),
    deliveryDate    VARCHAR(100),
    status          VARCHAR(100)
  )`);

  // Vendors
  await pool.execute(`CREATE TABLE IF NOT EXISTS vendors (
    id              VARCHAR(100) PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255),
    address         TEXT,
    materialsJoined TEXT
  )`);

  // Settings (key-value store)
  await pool.execute(`CREATE TABLE IF NOT EXISTS settings (
    setting_key     VARCHAR(100) PRIMARY KEY,
    setting_value   TEXT
  )`);

  // Issue Logs
  await pool.execute(`CREATE TABLE IF NOT EXISTS issue_logs (
    id          VARCHAR(100) PRIMARY KEY,
    lotId       VARCHAR(100),
    isReissue   TINYINT DEFAULT 0,
    isReturn    TINYINT DEFAULT 0,
    category    VARCHAR(100),
    volume      INT DEFAULT 0,
    personName  VARCHAR(255),
    date        VARCHAR(100),
    materials   TEXT
  )`);

  // Design History Logs
  await pool.execute(`CREATE TABLE IF NOT EXISTS design_history (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    lotId       VARCHAR(100) NOT NULL,
    action      VARCHAR(50) NOT NULL,
    actorName   VARCHAR(255) NOT NULL,
    timestamp   VARCHAR(100) NOT NULL,
    details     TEXT
  )`);

  // Scans Log
  await pool.execute(`CREATE TABLE IF NOT EXISTS scans (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    lot_number     VARCHAR(100),
    scan_type      VARCHAR(100),
    person_name    VARCHAR(255) NOT NULL,
    material_name  VARCHAR(255) NOT NULL,
    quantity       DOUBLE DEFAULT 0,
    supplier_name  VARCHAR(255) NOT NULL,
    scanned_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    rgp_payload    TEXT NULL
  )`);

  // ── Seed data (only if tables are empty) ────────────────────────────────────

  const [[{ count: dCount }]] = await pool.execute('SELECT COUNT(*) as count FROM designs');
  if (dCount === 0) {
    for (const d of initialDesigns) {
      await pool.execute(
        `REPLACE INTO designs
          (id,name,lotNo2,brand,category,designer,fabricType,targetSizes,colorCode,status,date,
           comments,section,season,style,tapeLace,bottomType,zip,sticker,collar,bone,fullBaju,
           bom,totalCost,imageUrl,quantity)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [d.id, d.name, d.lotNo2, d.brand, d.category, d.designer, d.fabricType, d.targetSizes,
        d.colorCode, d.status, d.date, d.comments || '', d.section, d.season, d.style, d.tapeLace,
        d.bottomType, d.zip, d.sticker, d.collar, d.bone, d.fullBaju, d.bom, d.totalCost || 0, d.imageUrl || '', 100]
      );
    }
  }

  const [[{ count: mCount }]] = await pool.execute('SELECT COUNT(*) as count FROM materials');
  if (mCount === 0) {
    for (const m of initialMaterials) {
      await pool.execute(
        'INSERT INTO materials (id,name,category,stock,unit,cost,threshold,color) VALUES (?,?,?,?,?,?,?,?)',
        [m.id, m.name, m.category, m.stock, m.unit, m.cost, m.threshold, m.color]
      );
    }
  }

  const [[{ count: poCount }]] = await pool.execute('SELECT COUNT(*) as count FROM purchase_orders');
  if (poCount === 0) {
    for (const po of initialPOs) {
      await pool.execute(
        `REPLACE INTO purchase_orders
          (id,poNumber,vendorName,vendorEmail,vendorAddress,designName,designCategory,
           items,subtotal,taxRate,tax,total,date,deliveryDate,status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [po.id, po.poNumber, po.vendorName, po.vendorEmail, po.vendorAddress,
        po.designName, po.designCategory, po.items, po.subtotal, po.taxRate,
        po.tax, po.total, po.date, po.deliveryDate, po.status]
      );
    }
  }

  const [[{ count: vCount }]] = await pool.execute('SELECT COUNT(*) as count FROM vendors');
  if (vCount === 0) {
    for (const v of initialVendors) {
      await pool.execute(
        'INSERT INTO vendors (id,name,email,address,materialsJoined) VALUES (?,?,?,?,?)',
        [v.id, v.name, v.email, v.address, v.materialsJoined]
      );
    }
  }

  const [[{ count: sCount }]] = await pool.execute('SELECT COUNT(*) as count FROM settings');
  if (sCount === 0) {
    await pool.execute('REPLACE INTO settings (setting_key,setting_value) VALUES (?,?)',
      ['accessories_list', JSON.stringify(initialAccessories)]);
    await pool.execute('REPLACE INTO settings (setting_key,setting_value) VALUES (?,?)',
      ['designers_list', JSON.stringify(initialDesigners)]);
  }

  const [[{ count: hCount }]] = await pool.execute('SELECT COUNT(*) as count FROM design_history');
  if (hCount === 0) {
    await pool.execute("INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES ('11000', 'created', 'Sarah Connor', '10/08/2023 10:24', 'Lot created with category JACKET, style ST-9921')");
    await pool.execute("INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES ('11001', 'created', 'Michael Scott', '08/08/2023 11:15', 'Lot created with category T-SHIRT COLLAR, style TS-2201')");
    await pool.execute("INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES ('11001', 'approved', 'Admin', '08/08/2023 16:40', 'BOM verified and approved.')");
    await pool.execute("INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES ('11002', 'created', 'Sarah Connor', '02/08/2023 09:30', 'Lot created with category LOWER, style TR-3304')");
    await pool.execute("INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES ('11002', 'approved', 'Admin', '02/08/2023 14:12', 'BOM verified and approved.')");
  }

  console.log('[DB] All tables ready.');
}

// ── Users ─────────────────────────────────────────────────────────────────────

// Helper to format Date/ISO string to MySQL DATETIME format in local timezone (YYYY-MM-DD HH:mm:ss)
const toMysqlDatetime = (dateInput) => {
  if (!dateInput) return null;
  const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const getUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

export const getUserById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

export const createUser = async (name, email, password, role, otp_code = null, otp_expires = null) => {
  const createdAt = toMysqlDatetime(new Date());
  const formattedOtpExpires = toMysqlDatetime(otp_expires);
  const [result] = await pool.execute(
    'INSERT INTO users (name,email,password,role,otp_code,otp_expires,created_at) VALUES (?,?,?,?,?,?,?)',
    [name, email, password, role, otp_code, formattedOtpExpires, createdAt]
  );
  return result.insertId;
};

export const verifyUserOtp = async (email) => {
  await pool.execute('UPDATE users SET verified=1, otp_code=NULL, otp_expires=NULL WHERE email=?', [email]);
};

export const updateUserOtp = async (email, otpCode, otpExpires) => {
  const formattedOtpExpires = toMysqlDatetime(otpExpires);
  await pool.execute('UPDATE users SET otp_code=?, otp_expires=? WHERE email=?', [otpCode, formattedOtpExpires, email]);
};


// ── Designs ───────────────────────────────────────────────────────────────────

export const getAllDesigns = async () => {
  const [rows] = await pool.execute('SELECT * FROM designs');
  return rows;
};

export const getDesignById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM designs WHERE id = ?', [id]);
  return rows[0] || null;
};

export const createDesign = async (d) => {
  if (d.created_at) {
    const localDate = new Date(d.created_at);
    const pad = n => String(n).padStart(2, '0');
    const dbDate = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())} ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:${pad(localDate.getSeconds())}`;
    await pool.execute(
      `REPLACE INTO designs
        (id,name,lotNo2,brand,category,designer,fabricType,targetSizes,colorCode,status,date,
         comments,section,season,style,tapeLace,bottomType,zip,sticker,collar,bone,fullBaju,
         bom,totalCost,imageUrl,quantity,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.id, d.name, d.lotNo2, d.brand, d.category, d.designer, d.fabricType, d.targetSizes,
       d.colorCode, d.status, d.date, d.comments || '', d.section, d.season, d.style, d.tapeLace,
       d.bottomType, d.zip, d.sticker, d.collar, d.bone, d.fullBaju, d.bom, d.totalCost || 0, d.imageUrl || '', d.quantity || 100, dbDate]
    );
  } else {
    await pool.execute(
      `REPLACE INTO designs
        (id,name,lotNo2,brand,category,designer,fabricType,targetSizes,colorCode,status,date,
         comments,section,season,style,tapeLace,bottomType,zip,sticker,collar,bone,fullBaju,
         bom,totalCost,imageUrl,quantity)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.id, d.name, d.lotNo2, d.brand, d.category, d.designer, d.fabricType, d.targetSizes,
       d.colorCode, d.status, d.date, d.comments || '', d.section, d.season, d.style, d.tapeLace,
       d.bottomType, d.zip, d.sticker, d.collar, d.bone, d.fullBaju, d.bom, d.totalCost || 0, d.imageUrl || '', d.quantity || 100]
    );
  }
};

export const updateDesignStatus = async (id, status, comments) => {
  await pool.execute('UPDATE designs SET status=?, comments=? WHERE id=?', [status, comments, id]);
};

// ── Materials ─────────────────────────────────────────────────────────────────

export const getAllMaterials = async () => {
  const [rows] = await pool.execute('SELECT * FROM materials');
  return rows;
};

export const upsertMaterial = async (m) => {
  await pool.execute(
    'REPLACE INTO materials (id,name,category,stock,unit,cost,threshold,color) VALUES (?,?,?,?,?,?,?,?)',
    [m.id, m.name, m.category, m.stock, m.unit, m.cost, m.threshold, m.color || '']
  );
};

export const deleteMaterial = async (id) => {
  await pool.execute('DELETE FROM materials WHERE id=?', [id]);
};

// ── Approval Requests ─────────────────────────────────────────────────────────

export const getAllApprovalRequests = async () => {
  const [rows] = await pool.execute('SELECT * FROM approval_requests ORDER BY date DESC');
  return rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [], isReissue: !!r.isReissue }));
};

export const createApprovalRequest = async (req) => {
  const itemsJson = req.items ? JSON.stringify(req.items) : '[]';
  await pool.execute(
    `INSERT INTO approval_requests
      (id,type,status,requesterName,requesterRole,date,lotId,pieces,personName,isReissue,items,materialId,materialName,reason)
     VALUES (?,?,'pending',?,?,?,?,?,?,?,?,?,?,?)`,
    [req.id, req.type, req.requesterName || '', req.requesterRole || '', req.date || '',
    req.lotId || '', req.pieces || 0, req.personName || '', req.isReissue ? 1 : 0,
      itemsJson, req.materialId || '', req.materialName || '', req.reason || '']
  );
};

export const updateApprovalRequestStatus = async (id, status, extra = {}) => {
  await pool.execute(
    'UPDATE approval_requests SET status=?, rejectionReason=?, resolvedDate=? WHERE id=?',
    [status, extra.rejectionReason || '', extra.resolvedDate || '', id]
  );
};

// ── Purchase Orders ───────────────────────────────────────────────────────────

export const getAllPOs = async () => {
  const [rows] = await pool.execute('SELECT * FROM purchase_orders ORDER BY date DESC');
  return rows.map(r => ({ ...r, items: r.items ? JSON.parse(r.items) : [] }));
};

export const createPO = async (po) => {
  const itemsJson = po.items ? JSON.stringify(po.items) : '[]';
  await pool.execute(
    `REPLACE INTO purchase_orders
      (id,poNumber,vendorName,vendorEmail,vendorAddress,designName,designCategory,
       items,subtotal,taxRate,tax,total,date,deliveryDate,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [po.id, po.poNumber, po.vendorName || '', po.vendorEmail || '', po.vendorAddress || '',
    po.designName || '', po.designCategory || '', itemsJson,
    po.subtotal || 0, po.taxRate || 18, po.tax || 0, po.total || 0,
    po.date || '', po.deliveryDate || '', po.status || 'Draft']
  );
};

export const updatePOStatus = async (id, status) => {
  await pool.execute('UPDATE purchase_orders SET status=? WHERE id=?', [status, id]);
};

export const getPOByNumberOrId = async (poIdentifier) => {
  const [rows] = await pool.execute(
    'SELECT * FROM purchase_orders WHERE poNumber = ? OR id = ?',
    [poIdentifier, poIdentifier]
  );
  if (rows[0]) {
    return {
      ...rows[0],
      items: rows[0].items ? JSON.parse(rows[0].items) : []
    };
  }
  return null;
};


// ── Vendors ───────────────────────────────────────────────────────────────────

export const getAllVendors = async () => {
  const [rows] = await pool.execute('SELECT * FROM vendors');
  return rows;
};

export const createVendor = async (v) => {
  await pool.execute(
    'REPLACE INTO vendors (id,name,email,address,materialsJoined) VALUES (?,?,?,?,?)',
    [v.id, v.name, v.email || '', v.address || '', v.materialsJoined || '']
  );
};

export const deleteVendor = async (id) => {
  await pool.execute('DELETE FROM vendors WHERE id=?', [id]);
};

// ── Settings ──────────────────────────────────────────────────────────────────

export const getSetting = async (key) => {
  const [rows] = await pool.execute('SELECT setting_value FROM settings WHERE setting_key=?', [key]);
  return rows[0] ? JSON.parse(rows[0].setting_value) : null;
};

export const setSetting = async (key, value) => {
  await pool.execute(
    'REPLACE INTO settings (setting_key,setting_value) VALUES (?,?)',
    [key, JSON.stringify(value)]
  );
};

// ── Issue Logs ────────────────────────────────────────────────────────────────

export const getAllIssueLogs = async () => {
  const [rows] = await pool.execute('SELECT * FROM issue_logs ORDER BY date DESC');
  return rows.map(r => ({
    ...r,
    materials: r.materials ? JSON.parse(r.materials) : [],
    isReissue: !!r.isReissue,
    isReturn: !!r.isReturn
  }));
};

export const createIssueLog = async (log) => {
  const materialsJson = log.materials ? JSON.stringify(log.materials) : '[]';
  await pool.execute(
    `INSERT INTO issue_logs (id,lotId,isReissue,isReturn,category,volume,personName,date,materials)
     VALUES (?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE lotId=VALUES(lotId), date=VALUES(date)`,
    [log.id, log.lotId || '', log.isReissue ? 1 : 0, log.isReturn ? 1 : 0,
    log.category || '', log.volume || 0, log.personName || '', log.date || '', materialsJson]
  );
};

export const getCuttingMatrixByLot = async (lotNo) => {
  const [headers] = await pool.execute('SELECT * FROM cutting_header WHERE Lot_Number = ?', [lotNo]);
  if (headers.length === 0) return null;

  const header = headers[0];
  const [matrixRows] = await pool.execute('SELECT * FROM cuttings_matrix WHERE header_id = ?', [header.id]);

  const parsedRows = matrixRows.map(row => {
    const sizes = {};
    if (row.M !== null) sizes['M'] = row.M;
    if (row.L !== null) sizes['L'] = row.L;
    if (row.XL !== null) sizes['XL'] = row.XL;
    if (row.XXL !== null) sizes['XXL'] = row.XXL;

    return {
      color: row.Color || '',
      cuttingTable: row.Cutting_Table,
      sizes: sizes,
      totalPcs: row.Total_Pcs || 0
    };
  });

  return {
    lotNumber: header.Lot_Number,
    style: header.Style || '',
    fabric: header.Fabric || '',
    garmentType: header.Garment_Type || '',
    brand: header.Brand || '',
    partyName: header.Party_Name || '',
    rows: parsedRows
  };
};

export const createHistoryEntry = async (lotId, action, actorName, details = '') => {
  const timestamp = new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  await pool.execute(
    'INSERT INTO design_history (lotId, action, actorName, timestamp, details) VALUES (?, ?, ?, ?, ?)',
    [lotId, action, actorName, timestamp, details]
  );
};

export const getAllHistory = async () => {
  const [rows] = await pool.execute('SELECT * FROM design_history ORDER BY id DESC');
  return rows;
};

// ── Scanner Log entries ───────────────────────────────────────────────────────
export const createScanEntry = async (scan) => {
  await pool.execute(
    `INSERT INTO scans (lot_number, scan_type, person_name, material_name, quantity, supplier_name, rgp_payload)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      scan.lot_number || '',
      scan.scan_type || '',
      scan.person_name || '',
      scan.material_name || '',
      Number(scan.quantity) || 0,
      scan.supplier_name || '',
      scan.rgp_payload || null
    ]
  );
};

export const getAllScans = async () => {
  const [rows] = await pool.execute('SELECT * FROM scans ORDER BY scanned_at DESC');
  return rows;
};

export const getAllCuttingHeaders = async () => {
  const [rows] = await pool.execute('SELECT * FROM cutting_header ORDER BY Saved_At DESC');
  return rows;
};

export const getAllDooriOrders = async () => {
  const [rows] = await pool.execute(`
    SELECT 
      ch.Lot_Number,
      ch.Garment_Type,
      ch.Style,
      ch.Fabric,
      COALESCE(ch.Cutting_Qty, ch.Stitching_Issue_Qty, 0) as Total_Pieces,
      COALESCE(d.Issue_Date, ch.Date_of_Issue, ch.JobOrder_Date, '') as Issue_Date,
      COALESCE(d.Timestamp, ch.JobOrder_Date, '') as Timestamp,
      COALESCE(d.Supervisor, ch.Supervisor, '') as Supervisor,
      d.Dori_Selections,
      d.Selected_Placements,
      d.Placement_Quantities,
      d.Placement_Dori_Types,
      d.Total_Cost,
      d.Gate_Entry_Person,
      d.Gate_Entry_Date,
      d.Material_Received_By,
      d.Material_Received_Date,
      d.Supplier_Name,
      d.Material_Entry_Date,
      d.dori_payload
    FROM cutting_header ch
    LEFT JOIN doori d ON ch.Lot_Number = d.Lot_Number
    ORDER BY ch.Saved_At DESC
  `);
  return rows;
};

export const updateCuttingHeaderPayload = async (lotNo, payload) => {
  await pool.execute(
    'UPDATE cutting_header SET zip_payload = ? WHERE Lot_Number = ?',
    [payload, lotNo]
  );
};

export const updateDooriPayload = async (lotNo, data) => {
  const [existing] = await pool.execute('SELECT 1 FROM doori WHERE Lot_Number = ?', [lotNo]);
  if (existing.length > 0) {
    await pool.execute(
      `UPDATE doori SET 
         dori_payload = ?,
         Dori_Selections = ?,
         Selected_Placements = ?,
         Placement_Quantities = ?,
         Placement_Dori_Types = ?
       WHERE Lot_Number = ?`,
      [
        data.dori_payload,
        data.Dori_Selections,
        data.Selected_Placements,
        data.Placement_Quantities,
        data.Placement_Dori_Types,
        lotNo
      ]
    );
  } else {
    const [cutting] = await pool.execute('SELECT * FROM cutting_header WHERE Lot_Number = ?', [lotNo]);
    const cutRow = cutting[0] || {};
    await pool.execute(
      `INSERT INTO doori (
         Lot_Number, Garment_Type, Style, Fabric, Total_Pieces, Issue_Date, Supervisor,
         dori_payload, Dori_Selections, Selected_Placements, Placement_Quantities, Placement_Dori_Types, Total_Cost
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        lotNo,
        cutRow.Garment_Type || '',
        cutRow.Style || '',
        cutRow.Fabric || '',
        parseInt(cutRow.Cutting_Qty || cutRow.Stitching_Issue_Qty) || 0,
        cutRow.Date_of_Issue || cutRow.JobOrder_Date || '',
        cutRow.Supervisor || '',
        data.dori_payload,
        data.Dori_Selections,
        data.Selected_Placements,
        data.Placement_Quantities,
        data.Placement_Dori_Types,
        0.0
      ]
    );
  }
};

export const resetLotOperationalData = async (lotNo) => {
  const lotNoLower = lotNo.trim().toLowerCase();
  
  // 1. Delete scans
  await pool.execute('DELETE FROM scans WHERE LOWER(lot_number) = ?', [lotNoLower]);
  
  // 2. Delete doori payload/order
  await pool.execute('DELETE FROM doori WHERE LOWER(Lot_Number) = ?', [lotNoLower]);
  
  // 3. Delete cutting header (Zip PO) and matrix rows
  await pool.execute('DELETE FROM cuttings_matrix WHERE LOWER(Lot_No) = ?', [lotNoLower]);
  await pool.execute('DELETE FROM cutting_header WHERE LOWER(Lot_Number) = ?', [lotNoLower]);
  
  // 4. Delete issue logs
  await pool.execute('DELETE FROM issue_logs WHERE LOWER(lotId) = ?', [lotNoLower]);
  
  // 5. Delete approval requests
  await pool.execute('DELETE FROM approval_requests WHERE LOWER(lotId) = ?', [lotNoLower]);
  
  // 6. Delete design history log
  await pool.execute('DELETE FROM design_history WHERE LOWER(lot_number) = ?', [lotNoLower]);
  
  // 7. Delete purchase orders that contain this lot
  await pool.execute('DELETE FROM purchase_orders WHERE items LIKE ?', [`%"lotNumber":"${lotNo}"%`]);
  await pool.execute('DELETE FROM purchase_orders WHERE items LIKE ?', [`%"lotNumber":"${lotNoLower}"%`]);
};

// ── Export pool as default ────────────────────────────────────────────────────
export default pool;

