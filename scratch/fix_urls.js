import fs from 'fs';
import path from 'path';

const frontendDir = 'c:\\Users\\mheng\\OneDrive\\Desktop\\bom of accessories\\bom of accessories\\frontend';
const srcDir = path.join(frontendDir, 'src');

function fixFile(filePath, isAppJsx = false) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const original = content;

  // 1. Remove / Replace local getBackendUrl functions
  // ScannerLogsView / PublicScanView local definition
  const localDefRegex = /const\s+getBackendUrl\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};/g;
  content = content.replace(localDefRegex, '');

  // pogenerate / dooripogenerate useMemo definition
  const useMemoDefRegex = /const\s+backendUrl\s*=\s*useMemo\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[\]\);/g;
  content = content.replace(useMemoDefRegex, 'const backendUrl = getBackendUrl();');

  // HistoryView backendUrl local variable setup
  content = content.replace(/const\s+hostname\s*=\s*window\.location\.hostname;\s*const\s+backendUrl\s*=\s*`http:\/\/\$\{hostname\}:5000`;/g, 'const backendUrl = getBackendUrl();');

  // 2. Perform general replacements of http://${window.location.hostname}:5000 and http://${hostname}:5000
  content = content.replace(/http:\/\/\$\{window\.location\.hostname\}:5000/g, '${getBackendUrl()}');
  content = content.replace(/http:\/\/\$\{hostname\}:5000/g, '${getBackendUrl()}');

  // Replace concatenation styles: 'http://' + window.location.hostname + ':5000'
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000'/g, 'getBackendUrl()');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*`:5000`/g, 'getBackendUrl()');
  content = content.replace(/'http:\/\/'\s*\+\s*hostname\s*\+\s*':5000'/g, 'getBackendUrl()');
  content = content.replace(/"http:\/\/"\s*\+\s*window\.location\.hostname\s*\+\s*":5000"/g, 'getBackendUrl()');

  // App.jsx specific replacements (fetches that are hardcoded with path strings)
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/lots'/g, '`${getBackendUrl()}/api/lots`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/designs'/g, '`${getBackendUrl()}/api/designs`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/materials'/g, '`${getBackendUrl()}/api/materials`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/approval-requests'/g, '`${getBackendUrl()}/api/approval-requests`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/pos'/g, '`${getBackendUrl()}/api/pos`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/vendors'/g, '`${getBackendUrl()}/api/vendors`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/settings'/g, '`${getBackendUrl()}/api/settings`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/issue-logs'/g, '`${getBackendUrl()}/api/issue-logs`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/auth\/me'/g, '`${getBackendUrl()}/api/auth/me`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/settings\/accessories_list'/g, '`${getBackendUrl()}/api/settings/accessories_list`');
  content = content.replace(/'http:\/\/'\s*\+\s*window\.location\.hostname\s*\+\s*':5000\/api\/settings\/designers_list'/g, '`${getBackendUrl()}/api/settings/designers_list`');

  // 3. Inject import statements if getBackendUrl is referenced
  if (isAppJsx) {
    if (!content.includes("import { getBackendUrl } from './utils/api';")) {
      content = "import { getBackendUrl } from './utils/api';\n" + content;
    }
    const localAppDef = /export\s+const\s+getBackendUrl\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\};/g;
    content = content.replace(localAppDef, 'export { getBackendUrl };');
  } else {
    if (content.includes('getBackendUrl') && !content.includes("from '../utils/api'")) {
      content = "import { getBackendUrl } from '../utils/api';\n" + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[FIXED] ${path.basename(filePath)}`);
  } else {
    console.log(`[OK] No changes needed in ${path.basename(filePath)}`);
  }
}

const filesToFix = [
  { file: 'App.jsx', isApp: true },
  { file: 'components/AuthView.jsx' },
  { file: 'components/DesignView.jsx' },
  { file: 'components/dooripogenerate.jsx' },
  { file: 'components/HistoryView.jsx' },
  { file: 'components/MaterialIssueView.jsx' },
  { file: 'components/MaterialVerificationView.jsx' },
  { file: 'components/pogenerate.jsx' },
  { file: 'components/PublicScanView.jsx' },
  { file: 'components/ReDownloadView.jsx' },
  { file: 'components/ScannerLogsView.jsx' },
  { file: 'components/rgp.jsx' },
  { file: 'components/GeneratePOView.jsx' }
];

for (const entry of filesToFix) {
  const fullPath = path.join(srcDir, entry.file);
  fixFile(fullPath, entry.isApp || false);
}
