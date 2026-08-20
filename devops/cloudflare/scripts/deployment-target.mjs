import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { loadEnvironmentManifest } from '../../environment-config/index.mjs';

const segmentPattern = /^[a-z][a-z0-9-]*$/;

export function resolveDeploymentTarget(workspaceDirectory, component) {
  const environment = process.env['DEPLOY_ENVIRONMENT'];

  if (!environment || !segmentPattern.test(environment)) {
    throw new Error('DEPLOY_ENVIRONMENT must be a lowercase environment name.');
  }

  if (!segmentPattern.test(component)) {
    throw new Error(`Invalid deployment component: ${component}`);
  }

  const { configPath, manifest } = loadEnvironmentManifest(workspaceDirectory, environment);
  const target = manifest.cloudflare[component];

  if (!target) {
    throw new Error(`Unknown Cloudflare component ${component} in ${configPath}.`);
  }

  return {
    environment,
    workerName: target.workerName,
    domains: target.domains,
  };
}

export function toWranglerTargetArguments(target) {
  return ['--name', target.workerName, ...target.domains.flatMap((domain) => ['--domain', domain])];
}

export function createEnvironmentWranglerConfig(cloudflareDirectory, component, target) {
  const sourcePath = path.join(cloudflareDirectory, component, 'wrangler.jsonc');
  const generatedPath = path.join(cloudflareDirectory, component, 'wrangler.generated.jsonc');
  const source = readFileSync(sourcePath, 'utf8');
  const generated = source.replace(
    /"name":\s*"[a-z][a-z0-9-]*-unconfigured"/,
    `"name": "${target.workerName}"`,
  );

  if (generated === source) {
    throw new Error(`Wrangler config does not contain an unconfigured Worker name: ${sourcePath}`);
  }

  writeFileSync(generatedPath, generated);

  return {
    path: generatedPath,
    remove: () => rmSync(generatedPath, { force: true }),
  };
}
