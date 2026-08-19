resource "cloudflare_ruleset" "media_cache" {
  zone_id     = var.zone_id
  name        = "Public product media cache"
  description = "Cache immutable public product media without affecting SSR, admin, or API traffic."
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [{
    ref         = "cache_public_product_media"
    description = "Cache immutable objects under cdn.${var.domain}/products/"
    expression  = "(http.host eq \"cdn.${var.domain}\" and starts_with(http.request.uri.path, \"/products/\") and http.request.method in {\"GET\" \"HEAD\"})"
    action      = "set_cache_settings"
    enabled     = true

    action_parameters = {
      cache = true

      browser_ttl = {
        mode    = "override_origin"
        default = var.media_browser_ttl_seconds
      }

      edge_ttl = {
        mode    = "override_origin"
        default = var.media_edge_ttl_seconds
      }

      cache_key = {
        cache_deception_armor = true
      }

      serve_stale = {
        disable_stale_while_updating = false
      }
    }
  }]
}
