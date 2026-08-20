import { Container } from '@cloudflare/containers';
import { env } from 'cloudflare:workers';

interface ApiEnv {
  API_CONTAINER: DurableObjectNamespace<ApiContainer>;
  CF_VERSION_METADATA: WorkerVersionMetadata;
  DATABASE_URL: string;
  JWT_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  TAWK_API_KEY: string;
  TAWK_PROPERTY_ID: string;
  TAWK_WIDGET_ID: string;
  NOVA_POSHTA_API_KEY: string;
  OTEL_ENABLED: string;
  OTEL_EXPORTER_OTLP_ENDPOINT: string;
  OTEL_EXPORTER_OTLP_HEADERS: string;
  OTEL_EXPORTER_OTLP_PROTOCOL: string;
  OTEL_RESOURCE_ATTRIBUTES: string;
  OTEL_SERVICE_NAME: string;
}

const workerEnv = env as unknown as ApiEnv;
const workerVersion = workerEnv.CF_VERSION_METADATA.tag || workerEnv.CF_VERSION_METADATA.id;
const DATA_RETENTION_PATH = '/api/internal/data-retention';

export class ApiContainer extends Container<ApiEnv> {
  override defaultPort = 3001;
  override sleepAfter = '5m';
  override envVars = {
    NODE_ENV: 'prod',
    PORT: '3001',
    APP_VERSION: workerVersion,
    DATABASE_URL: workerEnv.DATABASE_URL,
    JWT_SECRET: workerEnv.JWT_SECRET,
    TELEGRAM_BOT_TOKEN: workerEnv.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: workerEnv.TELEGRAM_CHAT_ID,
    TAWK_API_KEY: workerEnv.TAWK_API_KEY,
    TAWK_PROPERTY_ID: workerEnv.TAWK_PROPERTY_ID,
    TAWK_WIDGET_ID: workerEnv.TAWK_WIDGET_ID,
    NOVA_POSHTA_API_KEY: workerEnv.NOVA_POSHTA_API_KEY,
    OTEL_ENABLED: workerEnv.OTEL_ENABLED,
    OTEL_EXPORTER_OTLP_ENDPOINT: workerEnv.OTEL_EXPORTER_OTLP_ENDPOINT,
    OTEL_EXPORTER_OTLP_HEADERS: workerEnv.OTEL_EXPORTER_OTLP_HEADERS,
    OTEL_EXPORTER_OTLP_PROTOCOL: workerEnv.OTEL_EXPORTER_OTLP_PROTOCOL,
    OTEL_RESOURCE_ATTRIBUTES: `${workerEnv.OTEL_RESOURCE_ATTRIBUTES},service.version=${workerVersion}`,
    OTEL_SERVICE_NAME: workerEnv.OTEL_SERVICE_NAME,
  };
}

export default {
  async fetch(request: Request, env: ApiEnv): Promise<Response> {
    const pathname = new URL(request.url).pathname;

    if (pathname === '/api/health/edge') {
      return Response.json({ status: 'ok', service: 'api-worker' });
    }

    if (pathname === DATA_RETENTION_PATH) {
      return new Response('Not Found', { status: 404 });
    }

    const id = env.API_CONTAINER.idFromName('production');
    return await env.API_CONTAINER.get(id).fetch(request);
  },

  async scheduled(_controller: ScheduledController, env: ApiEnv): Promise<void> {
    const id = env.API_CONTAINER.idFromName('production');
    const response = await env.API_CONTAINER.get(id).fetch(
      new Request(`https://api-container.internal${DATA_RETENTION_PATH}`, { method: 'POST' }),
    );

    if (!response.ok) {
      throw new Error(`Data retention failed with HTTP ${response.status}: ${await response.text()}`);
    }
  },
};
