# Cloudflare edge — DNS, admin Pages, Origin CA for Full (strict) to Hetzner.

locals {
  web_hosts  = [var.domain, "www.${var.domain}"]
  api_host   = "api.${var.domain}"
  cdn_host   = "cdn.${var.domain}"
  admin_host = "admin.${var.domain}"
}

resource "cloudflare_dns_record" "apex" {
  zone_id = var.cloudflare_zone_id
  name    = var.domain
  type    = "A"
  content = var.origin_ipv4
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "www" {
  zone_id = var.cloudflare_zone_id
  name    = "www.${var.domain}"
  type    = "A"
  content = var.origin_ipv4
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api.${var.domain}"
  type    = "A"
  content = var.origin_ipv4
  proxied = true
  ttl     = 1
}

resource "cloudflare_dns_record" "cdn" {
  zone_id = var.cloudflare_zone_id
  name    = local.cdn_host
  type    = "CNAME"
  # Proxied CNAMEs: content is hostname only; ttl must be 1 (automatic).
  content = var.cdn_cname_target
  proxied = true
  ttl     = 1
}

resource "cloudflare_pages_project" "admin" {
  account_id        = var.cloudflare_account_id
  name              = var.admin_pages_project
  production_branch = "main"

  deployment_configs = {
    production = {
      env_vars = {
        NODE_VERSION = {
          type  = "plain_text"
          value = "22"
        }
      }
    }
  }
}

resource "cloudflare_pages_domain" "admin" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.admin.name
  name         = local.admin_host
}

resource "cloudflare_dns_record" "admin" {
  zone_id = var.cloudflare_zone_id
  name    = local.admin_host
  type    = "CNAME"
  content = "${cloudflare_pages_project.admin.name}.pages.dev"
  proxied = true
  ttl     = 1
}

resource "tls_private_key" "origin" {
  count     = var.create_origin_ca ? 1 : 0
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "origin" {
  count           = var.create_origin_ca ? 1 : 0
  private_key_pem = tls_private_key.origin[0].private_key_pem

  subject {
    common_name = var.domain
  }

  dns_names = concat(local.web_hosts, [local.api_host])
}

resource "cloudflare_origin_ca_certificate" "origin" {
  count              = var.create_origin_ca ? 1 : 0
  csr                = tls_cert_request.origin[0].cert_request_pem
  hostnames          = concat(local.web_hosts, [local.api_host])
  request_type       = "origin-rsa"
  requested_validity = 5475 # ~15 years
}
