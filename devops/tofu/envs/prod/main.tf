# Production stack — wires domain modules. Add envs/stg later as a sibling copy.

locals {
  # Empty list keeps GitHub-hosted deploy SSH working; set SSH_ALLOWED_CIDRS in GH prod vars to lock down.
  ssh_allowed_cidrs = length(var.ssh_allowed_cidrs) > 0 ? var.ssh_allowed_cidrs : ["0.0.0.0/0", "::/0"]
}

module "app" {
  source = "../../modules/app"

  project_name      = var.project_name
  location          = var.location
  server_type       = var.server_type
  app_servers       = var.app_servers
  ssh_public_key    = var.ssh_public_key
  ssh_allowed_cidrs = local.ssh_allowed_cidrs
}

module "neon" {
  source = "../../modules/neon"

  project_name              = var.project_name
  org_id                    = var.neon_org_id
  region_id                 = var.neon_region_id
  pg_version                = var.neon_pg_version
  database_name             = var.neon_database_name
  role_name                 = var.neon_role_name
  min_cu                    = var.neon_min_cu
  max_cu                    = var.neon_max_cu
  suspend_timeout_seconds   = var.neon_suspend_timeout_seconds
  history_retention_seconds = var.neon_history_retention_seconds
}

module "object_storage" {
  source = "../../modules/object_storage"

  providers = {
    aws = aws.hetzner_s3
  }

  bucket = var.object_storage_bucket
}

module "edge" {
  source = "../../modules/edge"

  domain                = var.domain
  cloudflare_zone_id    = var.cloudflare_zone_id
  cloudflare_account_id = var.cloudflare_account_id
  origin_ipv4           = module.app.origin_ipv4
  cdn_cname_target      = trimsuffix(replace(var.object_storage_endpoint, "https://", ""), "/")
  admin_pages_project   = var.admin_pages_project
  create_origin_ca      = var.create_origin_ca
}
