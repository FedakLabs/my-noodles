import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';

import { loadEnvironmentManifest } from '../../devops/environment-config/index.mjs';

const [environment, application] = process.argv.slice(2);
const githubEnv = process.env['GITHUB_ENV'];
const applicationPattern = /^[a-z][a-z0-9-]*$/;
const variablePattern = /^[A-Z][A-Z0-9_]*$/;

if (!environment || !application || !githubEnv) {
  throw new Error('Environment, application, and GITHUB_ENV are required.');
}

if (!applicationPattern.test(application)) {
  throw new Error('Application names must be lowercase path segments.');
}

const { configPath, manifest } = loadEnvironmentManifest(process.cwd(), environment);
const config = manifest.applications[application];

if (!config) {
  throw new Error(`Unknown application ${application} in ${configPath}.`);
}

const entries = Object.entries(config);

for (const [name, value] of entries) {
  if (!variablePattern.test(name) || typeof value !== 'string') {
    throw new Error(`Invalid deployment configuration entry: ${name}`);
  }

  const delimiter = `MY_NOODLES_ENV_${randomUUID()}`;
  appendFileSync(githubEnv, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
}

console.log(`Loaded ${entries.length} public ${application} values for ${environment}.`);
