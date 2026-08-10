# Neon Postgres — managed EU project (scale-to-zero friendly).

resource "neon_project" "main" {
  name                      = var.project_name
  pg_version                = var.pg_version
  org_id                    = var.org_id
  region_id                 = var.region_id
  history_retention_seconds = var.history_retention_seconds

  branch {
    name          = var.branch_name
    database_name = var.database_name
    role_name     = var.role_name
  }

  default_endpoint_settings {
    autoscaling_limit_min_cu = var.min_cu
    autoscaling_limit_max_cu = var.max_cu
    suspend_timeout_seconds  = var.suspend_timeout_seconds
  }

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  url_extras = "channel_binding=require&connect_timeout=10"

  database_url = (
    strcontains(neon_project.main.connection_uri_pooler, "?")
    ? "${neon_project.main.connection_uri_pooler}&${local.url_extras}"
    : "${neon_project.main.connection_uri_pooler}?sslmode=require&${local.url_extras}"
  )

  database_url_direct = (
    strcontains(neon_project.main.connection_uri, "?")
    ? "${neon_project.main.connection_uri}&${local.url_extras}"
    : "${neon_project.main.connection_uri}?sslmode=require&${local.url_extras}"
  )
}
