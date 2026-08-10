output "app_ipv4" {
  description = "App server public IPv4 addresses"
  value       = module.app.app_ipv4
}

output "origin_ipv4" {
  description = "Address Cloudflare should proxy to (Hetzner LB)"
  value       = module.app.origin_ipv4
}

output "load_balancer_ipv4" {
  value = module.app.load_balancer_ipv4
}

output "admin_pages_project" {
  value = module.edge.admin_pages_project
}

output "admin_pages_url" {
  value = module.edge.admin_pages_url
}

output "object_storage_bucket" {
  value = module.object_storage.bucket
}

output "cdn_hostname" {
  value = module.edge.cdn_hostname
}

output "origin_ca_certificate_pem" {
  description = "Install on VM as certs/origin.pem"
  value       = module.edge.origin_ca_certificate_pem
  sensitive   = true
}

output "origin_ca_private_key_pem" {
  description = "Install on VM as certs/origin.key — keep in encrypted state only"
  value       = module.edge.origin_ca_private_key_pem
  sensitive   = true
}

output "neon_project_id" {
  value = module.neon.project_id
}

output "neon_default_branch_id" {
  value = module.neon.default_branch_id
}

output "neon_database_name" {
  value = module.neon.database_name
}

output "neon_database_user" {
  value = module.neon.database_user
}

output "neon_database_url" {
  description = "Pooled URL for api runtime → GH secret DATABASE_URL"
  value       = module.neon.database_url
  sensitive   = true
}

output "neon_database_url_direct" {
  description = "Direct URL for TypeORM migrations → GH secret DATABASE_URL_DIRECT"
  value       = module.neon.database_url_direct
  sensitive   = true
}
