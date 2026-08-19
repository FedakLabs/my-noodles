output "bucket" {
  value = cloudflare_r2_bucket.this.name
}

output "public_domain" {
  value = cloudflare_r2_custom_domain.this.domain
}

output "public_domain_status" {
  value = cloudflare_r2_custom_domain.this.status
}
