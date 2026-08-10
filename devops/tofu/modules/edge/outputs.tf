output "cdn_hostname" {
  value = local.cdn_host
}

output "admin_pages_project" {
  value = cloudflare_pages_project.admin.name
}

output "admin_pages_url" {
  value = "https://${cloudflare_pages_project.admin.name}.pages.dev"
}

output "origin_ca_certificate_pem" {
  description = "Install on VM as certs/origin.pem"
  value       = var.create_origin_ca ? cloudflare_origin_ca_certificate.origin[0].certificate : null
  sensitive   = true
}

output "origin_ca_private_key_pem" {
  description = "Install on VM as certs/origin.key"
  value       = var.create_origin_ca ? tls_private_key.origin[0].private_key_pem : null
  sensitive   = true
}
