variable "account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "bucket" {
  type = string
}

variable "public_domain" {
  type = string
}

variable "location" {
  type        = string
  default     = "WEUR"
  description = "R2 location hint. WEUR keeps media near the initial European audience."
}
