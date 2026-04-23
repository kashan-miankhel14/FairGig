/**
 * FairGig — Run All Services
 * Starts all 7 services (frontend + 6 microservices) in parallel.
 * Usage: node scripts/run_all.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── Load backend .env ──────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', 'backend', '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m) {
      let v = (m[2] || '').trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      envVars[m[1]] = v;
    }
  });
  console.log('✅ Loaded backend env vars:', Object.keys(envVars).join(', '));
} else {
  console.warn('⚠️  backend/.env not found — services will use default DB URL');
}

// ── Service definitions ────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');

const services = [
  {
    name: 'Frontend',
    cwd: ROOT,
    command: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    color: '\x1b[36m',   // cyan
  },
  {
    name: 'Auth (8001)',
    cwd: path.join(ROOT, 'backend/services/auth_service'),
    command: 'python',
    args: ['main.py'],
    color: '\x1b[33m',   // yellow
  },
  {
    name: 'Earnings (8002)',
    cwd: path.join(ROOT, 'backend/services/earnings_service'),
    command: 'python',
    args: ['main.py'],
    color: '\x1b[32m',   // green
  },
  {
    name: 'Anomaly (8003)',
    cwd: path.join(ROOT, 'backend/services/anomaly_service'),
    command: 'python',
    args: ['main.py'],
    color: '\x1b[35m',   // magenta
  },
  {
    name: 'Grievance (8004)',
    cwd: path.join(ROOT, 'backend/services/grievance_service'),
    command: 'node',
    args: ['server.js'],
    color: '\x1b[34m',   // blue
  },
  {
    name: 'Analytics (8005)',
    cwd: path.join(ROOT, 'backend/services/analytics_service'),
    command: 'python',
    args: ['main.py'],
    color: '\x1b[31m',   // red
  },
  {
    name: 'Certificate (8006)',
    cwd: path.join(ROOT, 'backend/services/certificate_renderer'),
    command: 'node',
    args: ['index.js'],
    color: '\x1b[37m',   // white
  },
];

const RESET = '\x1b[0m';
const binPath = path.join(ROOT, 'node_modules', '.bin');
const PATH = `${binPath}${path.delimiter}${process.env.PATH}`;

console.log('\n🚀 Starting all FairGig services...\n');

const procs = [];

services.forEach(svc => {
  const proc = spawn(svc.command, svc.args, {
    cwd: svc.cwd,
    shell: true,
    env: { ...process.env, ...envVars, PATH },
  });

  procs.push(proc);

  proc.stdout.on('data', d => process.stdout.write(`${svc.color}[${svc.name}]${RESET} ${d}`));
  proc.stderr.on('data', d => process.stderr.write(`${svc.color}[${svc.name}]${RESET} ${d}`));
  proc.on('close', code => console.log(`${svc.color}[${svc.name}]${RESET} exited (${code})`));
  proc.on('error', err => console.error(`${svc.color}[${svc.name}]${RESET} error: ${err.message}`));
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  procs.forEach(p => p.kill());
  process.exit(0);
});
