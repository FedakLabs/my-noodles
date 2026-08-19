output "media_bucket" {
  value = module.media.bucket
}

output "media_public_domain" {
  value = module.media.public_domain
}

output "media_public_domain_status" {
  value = module.media.public_domain_status
}

output "worker_hosts" {
  value = module.cloudflare.worker_hosts
}

output "cloudflare_name_servers" {
  description = "Cloudflare-assigned nameservers to configure once at Namecheap."
  value       = module.cloudflare.name_servers
}

output "cloudflare_dnssec" {
  description = "DS record values to add at Namecheap after Cloudflare nameservers are active."
  value       = module.cloudflare.dnssec
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
