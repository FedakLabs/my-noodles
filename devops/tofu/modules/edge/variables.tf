variable "domain" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "cloudflare_account_id" {
  type = string
}

variable "origin_ipv4" {
  type        = string
  description = "Hetzner origin (app VM or LB) for web/api A records"
}

variable "cdn_cname_target" {
  type        = string
  description = "Hostname for cdn. CNAME (Object Storage host without scheme or trailing slash)"

  validation {
    condition     = !strcontains(var.cdn_cname_target, "://") && !endswith(var.cdn_cname_target, "/")
    error_message = "cdn_cname_target must be a bare hostname (no https:// or trailing /)."
  }
}

variable "admin_pages_project" {
  type = string
}

variable "create_origin_ca" {
  type = bool
}
