variable "state_passphrase" {
  type        = string
  sensitive   = true
  description = "OpenTofu state encryption passphrase supplied by the infrastructure workflow."
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "domain" {
  type        = string
  description = "Base domain for this environment."
}

variable "environment" {
  type        = string
  description = "Lowercase deployment environment identifier supplied by the workflow."

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*$", var.environment))
    error_message = "environment must be a lowercase path-safe identifier."
  }
}

variable "grafana_url" {
  type        = string
  description = "URL of the existing Grafana Cloud stack."

  validation {
    condition     = startswith(var.grafana_url, "https://")
    error_message = "grafana_url must use HTTPS."
  }
}

variable "grafana_api_service_name" {
  type        = string
  default     = "my-noodles-api"
  description = "OpenTelemetry service.name used by Grafana dashboard queries."
}

variable "media_bucket" {
  type        = string
  description = "Environment-specific R2 media bucket name."
}

variable "manage_cloudflare_zone" {
  type        = bool
  description = "Whether this environment owns shared zone settings, DNSSEC, and media cache rules. Exactly one environment per zone should enable this."
}

variable "neon_org_id" {
  type = string
}

variable "neon_region_id" {
  type    = string
  default = "aws-eu-central-1"
}

variable "neon_pg_version" {
  type    = number
  default = 17
}

variable "neon_database_name" {
  type    = string
  default = "my_noodles"
}

variable "neon_role_name" {
  type    = string
  default = "my_noodles"
}

variable "neon_branch_name" {
  type        = string
  description = "Name of the initial Neon branch for this environment."
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
  type    = number
  default = 300
}

variable "neon_history_retention_seconds" {
  type    = number
  default = 21600
}
