import 'reflect-metadata';
import { prepareInstrumentation } from '@my-noodles/api-lib/otel';

import { config } from './config';

prepareInstrumentation(config.otel);
