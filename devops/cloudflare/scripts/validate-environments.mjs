import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvironmentManifest } from '../../environment-config/index.mjs';
import { resolveDeploymentTarget } from './deployment-target.mjs';

const cloudflareDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceDirectory = path.resolve(cloudflareDirectory, '../..');
const environmentsDirectory = path.join(workspaceDirectory, 'devops/envs');
const environments = readdirSync(environmentsDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const workerNames = new Set();
const domains = new Set();
const publicUrlVariables = {
  web: 'NEXT_PUBLIC_SITE_URL',
  admin: 'ADMIN_PUBLIC_URL',
  api: 'API_PUBLIC_URL',
};

for (const environment of environments) {
  process.env['DEPLOY_ENVIRONMENT'] = environment;
  const { manifest } = loadEnvironmentManifest(workspaceDirectory, environment);

  for (const component of Object.keys(publicUrlVariables)) {
    const target = resolveDeploymentTarget(workspaceDirectory, component);
    const applicationConfig = manifest.applications[component];
    const expectedDomain = new URL(applicationConfig[publicUrlVariables[component]]).hostname;

    if (workerNames.has(target.workerName)) {
      throw new Error(`Duplicate Cloudflare Worker name: ${target.workerName}`);
    }

    workerNames.add(target.workerName);

    for (const domain of target.domains) {
      if (domains.has(domain)) {
        throw new Error(`Duplicate Cloudflare custom domain: ${domain}`);
      }

      domains.add(domain);
    }

    if (!target.domains.includes(expectedDomain)) {
      throw new Error(
        `${environment}/${component} does not deploy to its configured public URL domain: ${expectedDomain}`,
      );
    }
  }
}

console.log(`Validated ${environments.length} Cloudflare deployment environment(s).`);
