provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "neon" {}

provider "grafana" {
  url = var.grafana_url
}
