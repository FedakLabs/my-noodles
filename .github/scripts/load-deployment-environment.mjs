import { randomUUID } from 'node:crypto';
import { appendFileSync } from 'node:fs';

import { loadEnvironmentManifest } from '../../devops/scripts/load-environment.mjs';

const [environment, application] = process.argv.slice(2);
const githubEnv = process.env['GITHUB_ENV'];

if (!environment || !githubEnv) {
  throw new Error('Environment and GITHUB_ENV are required.');
}

const { configPath, manifest } = loadEnvironmentManifest(process.cwd(), environment);
const configurations = application
  ? { [application]: manifest.applications[application] }
  : manifest.applications;

if (application && !configurations[application]) {
  throw new Error(`Unknown application ${application} in ${configPath}.`);
}

let loadedValues = 0;

for (const config of Object.values(configurations)) {
  for (const [name, value] of Object.entries(config)) {
    const delimiter = `MY_NOODLES_ENV_${randomUUID()}`;
    appendFileSync(githubEnv, `${name}<<${delimiter}\n${value}\n${delimiter}\n`);
    loadedValues += 1;
  }
}

console.log(`Loaded ${loadedValues} public ${application ?? 'application'} values for ${environment}.`);
