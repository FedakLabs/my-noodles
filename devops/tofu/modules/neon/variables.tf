variable "project_name" {
  type = string
}

variable "org_id" {
  type = string
}

variable "region_id" {
  type = string
}

variable "pg_version" {
  type = number
}

variable "database_name" {
  type = string
}

variable "role_name" {
  type = string
}

variable "min_cu" {
  type = number
}

variable "max_cu" {
  type = number
}

variable "suspend_timeout_seconds" {
  type = number
}

variable "history_retention_seconds" {
  type = number
}

variable "branch_name" {
  type    = string
  default = "production"
}
