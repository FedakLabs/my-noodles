import { appendFileSync, existsSync } from 'node:fs';
import { resolve, sep } from 'node:path';

import { loadEnvironmentManifest } from '../../devops/environment-config/index.mjs';

const [environment, requireInfrastructure = 'false'] = process.argv.slice(2);
const segmentPattern = /^[a-z][a-z0-9-]*$/;

if (!environment || !segmentPattern.test(environment)) {
  throw new Error('Environment names must be lowercase path segments.');
}

const environmentsRoot = `${resolve('devops/envs')}${sep}`;
const environmentDirectory = resolve(environmentsRoot, environment);

if (!environmentDirectory.startsWith(environmentsRoot) || !existsSync(environmentDirectory)) {
  throw new Error(`Unknown deployment environment: ${environment}`);
}

const { manifest } = loadEnvironmentManifest(process.cwd(), environment);
const infrastructureApplyRef = manifest.policy.infrastructureApplyRef;

if (process.env['GITHUB_ENV']) {
  appendFileSync(
    process.env['GITHUB_ENV'],
    `DEPLOY_INFRASTRUCTURE_APPLY_REF=${infrastructureApplyRef ?? ''}\n`,
  );
}

if (requireInfrastructure === 'true') {
  const tofuDirectory = resolve('devops/tofu/envs', environment);
  const tofuVariables = resolve(tofuDirectory, 'terraform.tfvars');

  if (!existsSync(tofuVariables)) {
    throw new Error(`Missing OpenTofu environment variables: ${tofuVariables}`);
  }
}

console.log(`Validated deployment environment: ${environment}`);
