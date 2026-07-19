18.07.2026

## Public API

https://publicapi.meest.com/#geo_localities - free public API

Hand-written client: `PublicMeestApi` in `src/meest/public/`.

## Client API

### Docs

https://wiki.meest-group.com/api/ua/v3.0/openAPI#/ - rich, with parcel management

### Swagger

https://wiki.meest-group.com/api/files/openAPI_ua.json?v=90456

Generated hey-api SDK: `src/meest/client/generated/`  
Wrapper: `ClientMeestApi` (`FetchApiClient` + custom `fetch`).

Regenerate:

```bash
pnpm --dir packages/integration-api-clients run meest:generate
```

Config: `src/meest/client/openapi-ts.config.ts`
