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
  type    = string
  default = "mynoodles.shop"
}

variable "environment" {
  type    = string
  default = "prod"
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
  type    = string
  default = "my-noodles-media"
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
