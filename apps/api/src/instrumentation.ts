import 'reflect-metadata';
import { prepareInstrumentation } from '@my-noodles/api-lib/otel';
import { prepareSentry } from '@my-noodles/api-lib/sentry';

import { config } from './config';

prepareInstrumentation(config.otel);
prepareSentry(config.sentry);
