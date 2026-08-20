terraform {
  required_version = ">= 1.10.0, < 2.0.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.15"
    }
    grafana = {
      source  = "grafana/grafana"
      version = "~> 4.42"
    }
  }
}
