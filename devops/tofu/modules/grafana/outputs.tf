output "folder_uid" {
  value = grafana_folder.observability.uid
}

output "folder_url" {
  value = grafana_folder.observability.url
}

output "api_dashboard_uid" {
  value = grafana_dashboard.api.uid
}

output "api_dashboard_url" {
  value = grafana_dashboard.api.url
}
