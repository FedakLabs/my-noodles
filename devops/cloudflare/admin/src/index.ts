interface AdminEnv {
  ASSETS: Fetcher;
}

export default {
  fetch(request: Request, env: AdminEnv): Promise<Response> {
    return env.ASSETS.fetch(request);
  },
};
