import { loadAppEnv, loadConfig, readConfigEnvironment } from '@my-noodles/api-lib/config';

loadAppEnv();

export const config = loadConfig(readConfigEnvironment(process.env), { rootDirname: __dirname });
