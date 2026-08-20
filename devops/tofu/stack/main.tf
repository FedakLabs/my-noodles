module "media" {
  source = "../modules/r2"

  bucket        = var.media_bucket
  zone_id       = var.cloudflare_zone_id
  account_id    = var.cloudflare_account_id
  public_domain = "cdn.${var.domain}"
}

module "cloudflare" {
  count  = var.manage_cloudflare_zone ? 1 : 0
  source = "../modules/cloudflare"

  zone_id = var.cloudflare_zone_id
  domain  = var.domain
}

module "neon" {
  source = "../modules/neon"

  project_name              = "${var.domain}-${var.environment}"
  org_id                    = var.neon_org_id
  region_id                 = var.neon_region_id
  pg_version                = var.neon_pg_version
  database_name             = var.neon_database_name
  role_name                 = var.neon_role_name
  min_cu                    = var.neon_min_cu
  max_cu                    = var.neon_max_cu
  suspend_timeout_seconds   = var.neon_suspend_timeout_seconds
  history_retention_seconds = var.neon_history_retention_seconds
  branch_name               = var.neon_branch_name
}

module "grafana" {
  source = "../modules/grafana"

  folder_uid       = "my-noodles-${var.environment}"
  folder_title     = "My Noodles (${var.environment})"
  dashboard_uid    = "my-noodles-api-${var.environment}"
  dashboard_title  = "API overview (${var.environment})"
  api_service_name = var.grafana_api_service_name
}
