terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.3"
    }
  }
}
