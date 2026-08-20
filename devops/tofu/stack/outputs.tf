output "environment" {
  value = var.environment
}

output "media_bucket" {
  value = module.media.bucket
}

output "media_public_domain" {
  value = module.media.public_domain
}

output "media_public_domain_status" {
  value = module.media.public_domain_status
}

output "cloudflare_name_servers" {
  description = "Cloudflare-assigned nameservers to configure once at Namecheap."
  value       = try(module.cloudflare[0].name_servers, null)
}

output "cloudflare_dnssec" {
  description = "DS record values to add at Namecheap after Cloudflare nameservers are active."
  value       = try(module.cloudflare[0].dnssec, null)
}

output "neon_database_url" {
  value     = module.neon.database_url
  sensitive = true
}

output "neon_database_url_direct" {
  value     = module.neon.database_url_direct
  sensitive = true
}

output "grafana_folder_url" {
  value = module.grafana.folder_url
}

output "grafana_api_dashboard_url" {
  value = module.grafana.api_dashboard_url
}
