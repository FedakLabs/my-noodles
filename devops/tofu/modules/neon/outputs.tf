output "project_id" {
  value = neon_project.main.id
}

output "default_branch_id" {
  value = neon_project.main.default_branch_id
}

output "database_name" {
  value = neon_project.main.database_name
}

output "database_user" {
  value = neon_project.main.database_user
}

output "database_url" {
  description = "Pooled URL → GH secret DATABASE_URL"
  value       = local.database_url
  sensitive   = true
}

output "database_url_direct" {
  description = "Direct URL → GH secret DATABASE_URL_DIRECT"
  value       = local.database_url_direct
  sensitive   = true
}
