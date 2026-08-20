locals {
  zone_settings = {
    "0rtt"                   = "off"
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    brotli                   = "on"
    early_hints              = "on"
    http3                    = "on"
    min_tls_version          = "1.2"
    ssl                      = "strict"
    tls_1_3                  = "on"
  }
}

resource "cloudflare_zone_setting" "baseline" {
  for_each = local.zone_settings

  zone_id    = var.zone_id
  setting_id = each.key
  value      = each.value
}
