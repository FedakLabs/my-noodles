interface AdminEnv {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: AdminEnv): Promise<Response> {
    if (new URL(request.url).pathname === '/favicon.ico') {
      return Response.redirect(new URL('/favicon.svg', request.url).toString(), 302);
    }

    return await env.ASSETS.fetch(request);
  },
};
