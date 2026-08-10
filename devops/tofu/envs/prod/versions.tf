terraform {
  required_version = ">= 1.8.0"

  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.68"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.3"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.15"
    }
  }
}
