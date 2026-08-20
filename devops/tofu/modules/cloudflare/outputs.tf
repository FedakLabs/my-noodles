output "name_servers" {
  description = "Cloudflare-assigned authoritative nameservers to configure at the domain registrar."
  value       = data.cloudflare_zone.this.name_servers
}

output "dnssec" {
  description = "DS record values to configure at the external registrar after Cloudflare nameservers are active."
  value = {
    algorithm        = cloudflare_zone_dnssec.this.algorithm
    digest           = cloudflare_zone_dnssec.this.digest
    digest_algorithm = cloudflare_zone_dnssec.this.digest_algorithm
    digest_type      = cloudflare_zone_dnssec.this.digest_type
    ds               = cloudflare_zone_dnssec.this.ds
    key_tag          = cloudflare_zone_dnssec.this.key_tag
    status           = cloudflare_zone_dnssec.this.status
  }
}

output "media_cache_ruleset_id" {
  value = cloudflare_ruleset.media_cache.id
}
