import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createEnvironmentWranglerConfig,
  resolveDeploymentTarget,
  toWranglerTargetArguments,
} from './deployment-target.mjs';

const component = process.argv[2];
const cloudflareDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceDirectory = path.resolve(cloudflareDirectory, '../..');
const executable = process.platform === 'win32' ? 'wrangler.cmd' : 'wrangler';
const executablePath = path.join(cloudflareDirectory, 'node_modules/.bin', executable);
const target = resolveDeploymentTarget(workspaceDirectory, component);
const generatedConfig = createEnvironmentWranglerConfig(cloudflareDirectory, component, target);
const passthroughArguments = process.argv.slice(3);

if (passthroughArguments[0] === '--') {
  passthroughArguments.shift();
}

const arguments_ = [
  'deploy',
  '--config',
  path.relative(cloudflareDirectory, generatedConfig.path),
  ...toWranglerTargetArguments(target),
  ...passthroughArguments,
];
const result = spawnSync(executablePath, arguments_, {
  cwd: cloudflareDirectory,
  env: process.env,
  stdio: 'inherit',
});

generatedConfig.remove();

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
