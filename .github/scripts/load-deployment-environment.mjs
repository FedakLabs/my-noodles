import { randomUUID } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const [environment, application] = process.argv.slice(2);
const githubEnv = process.env['GITHUB_ENV'];
const segmentPattern = /^[a-z][a-z0-9-]*$/;
const variablePattern = /^[A-Z][A-Z0-9_]*$/;

if (!environment || !application || !githubEnv) {
  throw new Error('Environment, application, and GITHUB_ENV are required.');
}

if (!segmentPattern.test(environment) || !segmentPattern.test(application)) {
  throw new Error('Environment and application names must be lowercase path segments.');
}

const environmentsRoot = `${resolve('devops/envs')}${sep}`;
const configPath = resolve(environmentsRoot, environment, `${application}.json`);

if (!configPath.startsWith(environmentsRoot)) {
  throw new Error('Deployment configuration must be inside devops/envs.');
}

const config = JSON.parse(readFileSync(configPath, 'utf8'));

if (config === null || Array.isArray(config) || typeof config !== 'object') {
  throw new Error(`Deployment configuration must be a JSON object: ${configPath}`);
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
