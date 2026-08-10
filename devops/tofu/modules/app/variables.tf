variable "project_name" {
  type = string
}

variable "location" {
  type = string
}

variable "server_type" {
  type = string
}

variable "app_servers" {
  type        = number
  description = "App VM count behind the LB (HA baseline is 2)."

  validation {
    condition     = var.app_servers >= 2
    error_message = "app_servers must be at least 2 for HA behind the load balancer."
  }
}

variable "ssh_public_key" {
  type = string
}

variable "ssh_allowed_cidrs" {
  type        = list(string)
  description = "CIDRs allowed to reach TCP/22. Prefer deploy/CI egress only (not 0.0.0.0/0)."
}

variable "deploy_path" {
  type    = string
  default = "/opt/my-noodles"
}
