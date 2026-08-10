variable "state_passphrase" {
  type        = string
  sensitive   = true
  # Dummy default so local `pnpm tofu:validate` works. CI always overrides via TF_VAR_state_passphrase.
  default     = "local-validate-only-xx"
  description = "OpenTofu state/plan encryption passphrase (≥16 chars). CI: TF_STATE_PASSPHRASE → TF_VAR_state_passphrase."
}

variable "hcloud_token" {
  type        = string
  sensitive   = true
  description = "Hetzner Cloud API token"
}

variable "cloudflare_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare API token (DNS, Pages, Origin CA)"
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID"
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Zone ID for mynoodles.shop"
}

variable "domain" {
  type        = string
  default     = "mynoodles.shop"
  description = "Apex domain"
}

variable "project_name" {
  type    = string
  default = "my-noodles"
}

variable "location" {
  type        = string
  default     = "fsn1"
  description = "Hetzner location (fsn1 / nbg1 / hel1)"
}

variable "server_type" {
  type        = string
  default     = "cx33"
  description = "App VM type (each node runs Caddy + web + api)"
}

variable "app_servers" {
  type        = number
  default     = 2
  description = "App VMs behind the Hetzner LB (minimum 2)"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key for the deploy user"
}

variable "ssh_allowed_cidrs" {
  type        = list(string)
  description = "CIDRs allowed on TCP/22. GH var SSH_ALLOWED_CIDRS = JSON array, e.g. [\"203.0.113.10/32\"]. Empty → open (GitHub-hosted runners have no stable egress)."
  default     = []
}

variable "admin_pages_project" {
  type        = string
  default     = "my-noodles-admin"
  description = "Cloudflare Pages project name for admin SPA"
}

variable "object_storage_endpoint" {
  type        = string
  default     = "https://fsn1.your-objectstorage.com"
  description = "Hetzner Object Storage S3 endpoint"
}

variable "object_storage_region" {
  type    = string
  default = "fsn1"
}

variable "object_storage_access_key" {
  type      = string
  sensitive = true
}

variable "object_storage_secret_key" {
  type      = string
  sensitive = true
}

variable "object_storage_bucket" {
  type    = string
  default = "my-noodles-media"
}

variable "create_origin_ca" {
  type        = bool
  default     = true
  description = "Issue Cloudflare Origin CA cert (SAN web+api hosts)"
}

# ── Neon ────────────────────────────────────────────────────────────────────
# API key: export NEON_API_KEY=... (provider reads it; never commit).

variable "neon_org_id" {
  type        = string
  description = "Neon Organization ID (org-…). Required — omit causes wrong-org / duplicate projects."
}

variable "neon_region_id" {
  type        = string
  default     = "aws-eu-central-1"
  description = "Neon region (Frankfurt EU)"
}

variable "neon_pg_version" {
  type        = number
  default     = 17
  description = "Postgres major on Neon. Align local docker-compose when changing."
}

variable "neon_database_name" {
  type    = string
  default = "my_noodles"
}

variable "neon_role_name" {
  type    = string
  default = "my_noodles"
}

variable "neon_min_cu" {
  type    = number
  default = 0.25
}

variable "neon_max_cu" {
  type    = number
  default = 1
}

variable "neon_suspend_timeout_seconds" {
  type        = number
  default     = 300
  description = "Idle seconds before scale-to-zero. -1 = never suspend."
}

variable "neon_history_retention_seconds" {
  type        = number
  default     = 21600
  description = "PITR window. Free plan max is 21600 (6h)."
}
