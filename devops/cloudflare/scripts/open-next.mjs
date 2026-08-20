import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createEnvironmentWranglerConfig,
  resolveDeploymentTarget,
  toWranglerTargetArguments,
} from './deployment-target.mjs';

const command = process.argv[2];

if (command !== 'build' && command !== 'deploy') {
  throw new Error('Expected OpenNext command to be either "build" or "deploy".');
}

const cloudflareDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceDirectory = path.resolve(cloudflareDirectory, '../..');
const webDirectory = path.join(workspaceDirectory, 'apps/web');
const executable = process.platform === 'win32' ? 'opennextjs-cloudflare.cmd' : 'opennextjs-cloudflare';
const executablePath = path.join(cloudflareDirectory, 'node_modules/.bin', executable);
const arguments_ = [command, '--config=../../devops/cloudflare/web/wrangler.jsonc'];
let generatedConfig;
const passthroughArguments = process.argv.slice(3);

if (passthroughArguments[0] === '--') {
  passthroughArguments.shift();
}

if (command === 'build') {
  arguments_.push('--openNextConfigPath=../../devops/cloudflare/web/open-next.config.ts');
} else {
  const target = resolveDeploymentTarget(workspaceDirectory, 'web');
  generatedConfig = createEnvironmentWranglerConfig(cloudflareDirectory, 'web', target);
  arguments_[1] = '--config=../../devops/cloudflare/web/wrangler.generated.jsonc';
  arguments_.push(...toWranglerTargetArguments(target));
}

arguments_.push(...passthroughArguments);

const result = spawnSync(executablePath, arguments_, {
  cwd: webDirectory,
  env: process.env,
  stdio: 'inherit',
});

generatedConfig?.remove();

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
