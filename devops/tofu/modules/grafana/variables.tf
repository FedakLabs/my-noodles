variable "folder_uid" {
  type        = string
  default     = "my-noodles"
  description = "Stable UID for the Grafana folder managed by OpenTofu."
}

variable "folder_title" {
  type        = string
  default     = "My Noodles"
  description = "Title of the Grafana folder managed by OpenTofu."
}

variable "api_service_name" {
  type        = string
  default     = "my-noodles-api"
  description = "OpenTelemetry service.name used by the API dashboard queries."
}

variable "dashboard_uid" {
  type        = string
  default     = "my-noodles-api"
  description = "Stable UID for the API observability dashboard."
}

variable "dashboard_title" {
  type        = string
  default     = "API overview"
  description = "Title of the API observability dashboard."
}

variable "refresh_interval" {
  type        = string
  default     = "30s"
  description = "Grafana dashboard refresh interval."
}
