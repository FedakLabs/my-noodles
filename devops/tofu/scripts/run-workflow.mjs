import { spawnSync } from 'node:child_process';

const environment = process.argv[2] ?? 'prod';
const ref = process.argv[3] ?? 'main';
const segmentPattern = /^[a-z][a-z0-9-]*$/;

if (!segmentPattern.test(environment)) {
  throw new Error('Environment names must be lowercase path segments.');
}

const result = spawnSync(
  'gh',
  ['workflow', 'run', 'infra.yml', '-f', `ref=${ref}`, '-f', `environment=${environment}`],
  { stdio: 'inherit' },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
