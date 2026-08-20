import { readFileSync } from 'node:fs';
import path from 'node:path';

export function loadEnvironmentManifest(workspaceDirectory, environment) {
  const environmentsDirectory = path.resolve(workspaceDirectory, 'devops/envs');
  const configPath = path.resolve(environmentsDirectory, environment, 'environment.json');
  const relativeConfigPath = path.relative(environmentsDirectory, configPath);

  if (
    relativeConfigPath === '..' ||
    relativeConfigPath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeConfigPath)
  ) {
    throw new Error('Deployment configuration must be inside devops/envs.');
  }

  return {
    configPath,
    manifest: JSON.parse(readFileSync(configPath, 'utf8')),
  };
}
