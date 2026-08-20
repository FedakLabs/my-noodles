import { readFileSync } from 'node:fs';
import path from 'node:path';

import { parse } from 'yaml';

const applicationNames = ['web', 'admin', 'api'];
const segmentPattern = /^[a-z][a-z0-9-]*$/;
const variablePattern = /^[A-Z][A-Z0-9_]*$/;
const workerNamePattern = /^[a-z][a-z0-9-]*$/;
const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
const applyRefPattern = /^[A-Za-z0-9._/-]+$/;

function isRecord(value) {
  return value !== null && !Array.isArray(value) && typeof value === 'object';
}

function assertKeys(record, expectedKeys, location) {
  const actualKeys = Object.keys(record).sort((left, right) => left.localeCompare(right));
  const sortedExpectedKeys = [...expectedKeys].sort((left, right) => left.localeCompare(right));

  if (actualKeys.join('\0') !== sortedExpectedKeys.join('\0')) {
    throw new Error(`${location} must contain exactly: ${sortedExpectedKeys.join(', ')}.`);
  }
}

function validateApplicationConfig(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be a mapping of environment variable names to strings.`);
  }

  for (const [name, variableValue] of Object.entries(value)) {
    if (!variablePattern.test(name) || typeof variableValue !== 'string') {
      throw new Error(`${location}.${name} must be a string environment variable.`);
    }
  }

  return value;
}

function validateCloudflareTarget(value, location) {
  if (!isRecord(value)) {
    throw new Error(`${location} must be a Cloudflare deployment target.`);
  }

  assertKeys(value, ['workerName', 'domains'], location);

  if (typeof value.workerName !== 'string' || !workerNamePattern.test(value.workerName)) {
    throw new Error(`${location}.workerName must be a lowercase Cloudflare Worker name.`);
  }

  if (
    !Array.isArray(value.domains) ||
    value.domains.length === 0 ||
    value.domains.some((domain) => typeof domain !== 'string' || !domainPattern.test(domain))
  ) {
    throw new Error(`${location}.domains must contain at least one valid domain.`);
  }

  return value;
}

function validateManifest(value, configPath) {
  if (!isRecord(value)) {
    throw new Error(`Deployment manifest must be a YAML mapping: ${configPath}`);
  }

  assertKeys(value, ['policy', 'cloudflare', 'applications'], configPath);

  if (!isRecord(value.policy)) {
    throw new Error(`${configPath}.policy must be a mapping.`);
  }

  assertKeys(value.policy, ['infrastructureApplyRef'], `${configPath}.policy`);

  if (
    value.policy.infrastructureApplyRef !== null &&
    (typeof value.policy.infrastructureApplyRef !== 'string' ||
      !applyRefPattern.test(value.policy.infrastructureApplyRef))
  ) {
    throw new Error(`${configPath}.policy.infrastructureApplyRef must be a Git ref or null.`);
  }

  if (!isRecord(value.cloudflare)) {
    throw new Error(`${configPath}.cloudflare must be a mapping.`);
  }

  if (!isRecord(value.applications)) {
    throw new Error(`${configPath}.applications must be a mapping.`);
  }

  assertKeys(value.cloudflare, applicationNames, `${configPath}.cloudflare`);
  assertKeys(value.applications, applicationNames, `${configPath}.applications`);

  for (const application of applicationNames) {
    value.cloudflare[application] = validateCloudflareTarget(
      value.cloudflare[application],
      `${configPath}.cloudflare.${application}`,
    );
    value.applications[application] = validateApplicationConfig(
      value.applications[application],
      `${configPath}.applications.${application}`,
    );
  }

  return value;
}

export function validateEnvironmentName(environment) {
  if (!environment || !segmentPattern.test(environment)) {
    throw new Error('Environment names must be lowercase path segments.');
  }
}

export function loadEnvironmentManifest(workspaceDirectory, environment) {
  validateEnvironmentName(environment);

  const environmentsDirectory = path.resolve(workspaceDirectory, 'devops/envs');
  const configPath = path.resolve(environmentsDirectory, environment, 'environment.yaml');
  const relativeConfigPath = path.relative(environmentsDirectory, configPath);

  if (relativeConfigPath.startsWith('..') || path.isAbsolute(relativeConfigPath)) {
    throw new Error('Deployment configuration must be inside devops/envs.');
  }

  const manifest = parse(readFileSync(configPath, 'utf8'), {
    prettyErrors: true,
    uniqueKeys: true,
  });

  return {
    configPath,
    manifest: validateManifest(manifest, configPath),
  };
}

export { applicationNames };
