/**
 * Runs infra/deploy-roll-mit-ui.sh on the server via SSH.
 *
 * Required: ROLL_MIT_DEPLOY_HOST (or DEPLOY_HOST) — IP or hostname (or SSH config Host alias).
 * Optional: ROLL_MIT_DEPLOY_USER / DEPLOY_USER — SSH user (omit if defined in SSH config).
 * Optional: ROLL_MIT_DEPLOY_REMOTE_DIR / DEPLOY_REMOTE_DIR — app root on server (default /home/roll-mit-ui).
 * Optional: ROLL_MIT_DEPLOY_SSH_EXTRA — extra args for ssh, space-separated (e.g. "-i ~/.ssh/key").
 *
 * Reads project root `.env` if present (Node does not load it automatically). Existing
 * environment variables are not overwritten.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import process from 'node:process';

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  let text = readFileSync(filePath, 'utf8');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key) continue;
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
loadEnvFile(join(repoRoot, '.env'));

const host =
  process.env.ROLL_MIT_DEPLOY_HOST?.trim() || process.env.DEPLOY_HOST?.trim();
const user = (
  process.env.ROLL_MIT_DEPLOY_USER?.trim() ||
  process.env.DEPLOY_USER?.trim() ||
  ''
).replace(/@$/, '');
const remoteDir = (
  process.env.ROLL_MIT_DEPLOY_REMOTE_DIR?.trim() ||
  process.env.DEPLOY_REMOTE_DIR?.trim() ||
  '/home/roll-mit-ui'
).replace(/\/$/, '');
const extraRaw = (
  process.env.ROLL_MIT_DEPLOY_SSH_EXTRA?.trim() || ''
).trim();

if (!host) {
  console.error(
    'Missing deploy target. Set ROLL_MIT_DEPLOY_HOST (or DEPLOY_HOST) in the project .env file or the shell.',
  );
  process.exit(1);
}

const target = user ? `${user}@${host}` : host;
const scriptPath = `${remoteDir}/infra/deploy-roll-mit-ui.sh`;

const extraArgs = extraRaw ? extraRaw.split(/\s+/).filter(Boolean) : [];
const sshArgs = [...extraArgs, target, 'bash', scriptPath];

const child = spawn('ssh', sshArgs, { stdio: 'inherit', shell: false });

child.on('error', (err) => {
  console.error('ssh failed to start. Is OpenSSH installed and on your PATH?', err.message);
  process.exit(1);
});

child.on('close', (code, signal) => {
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 1);
});
