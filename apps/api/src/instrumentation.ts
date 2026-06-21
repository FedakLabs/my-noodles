/**
 * Preload hook — run before the app via `node --import=./dist/instrumentation.js`.
 * Starts OTEL SDK synchronously so bootstrap, config, and DB errors are instrumented.
 */
import 'reflect-metadata';

import { prepareInstrumentation } from '@my-noodles/api-lib/otel';

import { config } from './config';

prepareInstrumentation(config.otel);
