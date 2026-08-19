variable "zone_id" {
  type = string
}

variable "domain" {
  type = string
}

variable "media_edge_ttl_seconds" {
  type        = number
  default     = 2592000
  description = "Cloudflare edge TTL for immutable product media. Defaults to 30 days."

  validation {
    condition     = var.media_edge_ttl_seconds >= 3600
    error_message = "media_edge_ttl_seconds must be at least one hour."
  }
}

variable "media_browser_ttl_seconds" {
  type        = number
  default     = 31536000
  description = "Browser TTL for immutable product media. Defaults to one year."

  validation {
    condition     = var.media_browser_ttl_seconds >= var.media_edge_ttl_seconds
    error_message = "media_browser_ttl_seconds must be greater than or equal to media_edge_ttl_seconds."
  }
}
