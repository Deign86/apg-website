import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Default configuration
const DEFAULT_MAX_MB = 200;

// Configured targets for build and cache artifacts
const TARGET_PATTERNS = [
  { path: 'dist', isDir: true },
  { path: 'node_modules/.vite', isDir: true },
  { path: '.vercel', isDir: true },
  { path: '*.log', isGlob: true },
];

/**
 * Parse human-readable size string (e.g., "200MB", "1GB", "500KB", "200") to bytes.
 */
function parseSizeToBytes(value, defaultMb = DEFAULT_MAX_MB) {
  if (!value) return defaultMb * 1024 * 1024;
  const match = String(value).trim().match(/^([0-9.]+)\s*([a-zA-Z]*)$/);
  if (!match) {
    console.warn(`[auto-clean] Invalid size format "${value}", defaulting to ${defaultMb}MB.`);
    return defaultMb * 1024 * 1024;
  }
  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  switch (unit) {
    case 'GB':
    case 'G':
      return num * 1024 * 1024 * 1024;
    case 'MB':
    case 'M':
    case '':
      return num * 1024 * 1024;
    case 'KB':
    case 'K':
      return num * 1024;
    case 'B':
      return num;
    default:
      console.warn(`[auto-clean] Unknown unit "${unit}", treating as MB.`);
      return num * 1024 * 1024;
  }
}

/**
 * Format bytes into human readable string.
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Calculate directory or file size recursively.
 */
function getPathSize(itemPath) {
  try {
    if (!fs.existsSync(itemPath)) return 0;
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      let total = 0;
      const files = fs.readdirSync(itemPath);
      for (const file of files) {
        total += getPathSize(path.join(itemPath, file));
      }
      return total;
    }
    return stat.size;
  } catch {
    return 0;
  }
}

/**
 * Find root log files matching *.log.
 */
function findLogFiles(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.log'))
      .map((entry) => path.join(dir, entry.name));
  } catch {
    return [];
  }
}

/**
 * Main execution
 */
function run() {
  const args = process.argv.slice(2);
  const isForce = args.includes('--force');
  const isDryRun = args.includes('--dry-run');
  const isQuiet = args.includes('--quiet');

  let thresholdBytes = DEFAULT_MAX_MB * 1024 * 1024;
  const sizeArg = args.find((arg) => arg.startsWith('--max-size=') || arg.startsWith('--threshold='));
  if (sizeArg) {
    const val = sizeArg.split('=')[1];
    thresholdBytes = parseSizeToBytes(val, DEFAULT_MAX_MB);
  }

  // Resolve existing targets
  const itemsToClean = [];
  for (const target of TARGET_PATTERNS) {
    if (target.isGlob) {
      const logs = findLogFiles(rootDir);
      for (const logPath of logs) {
        const size = getPathSize(logPath);
        if (size > 0) {
          itemsToClean.push({ path: logPath, size, relative: path.relative(rootDir, logPath) });
        }
      }
    } else {
      const fullPath = path.join(rootDir, target.path);
      if (fs.existsSync(fullPath)) {
        const size = getPathSize(fullPath);
        itemsToClean.push({ path: fullPath, size, relative: target.path });
      }
    }
  }

  const totalBytes = itemsToClean.reduce((sum, item) => sum + item.size, 0);

  if (!isQuiet) {
    console.log(`[auto-clean] Monitored artifacts total: ${formatBytes(totalBytes)} (Threshold: ${formatBytes(thresholdBytes)})`);
    for (const item of itemsToClean) {
      console.log(`  - ${item.relative}: ${formatBytes(item.size)}`);
    }
  }

  if (itemsToClean.length === 0) {
    if (!isQuiet) console.log('[auto-clean] No monitored artifacts found. Nothing to clean.');
    return;
  }

  const shouldClean = isForce || totalBytes > thresholdBytes;

  if (!shouldClean) {
    if (!isQuiet) {
      console.log(`[auto-clean] Size is below threshold (${formatBytes(totalBytes)} <= ${formatBytes(thresholdBytes)}). Cleanup skipped.`);
    }
    return;
  }

  if (isDryRun) {
    console.log(`[auto-clean] [DRY RUN] Size exceeds threshold or force flag used. Would delete ${formatBytes(totalBytes)}:`);
    for (const item of itemsToClean) {
      console.log(`  - Would remove: ${item.relative}`);
    }
    return;
  }

  console.log(`[auto-clean] Size threshold reached or force trigger (${formatBytes(totalBytes)}). Cleaning artifacts...`);
  let cleanedCount = 0;
  for (const item of itemsToClean) {
    try {
      fs.rmSync(item.path, { recursive: true, force: true });
      console.log(`  ✓ Removed ${item.relative} (${formatBytes(item.size)})`);
      cleanedCount++;
    } catch (err) {
      console.error(`  ✗ Failed to remove ${item.relative}:`, err.message);
    }
  }

  console.log(`[auto-clean] Completed. Reclaimed ${formatBytes(totalBytes)} across ${cleanedCount} target(s).`);
}

run();
