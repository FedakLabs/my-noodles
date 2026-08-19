resource "grafana_folder" "observability" {
  uid                          = var.folder_uid
  title                        = var.folder_title
  prevent_destroy_if_not_empty = true
}

resource "grafana_dashboard" "api" {
  folder    = grafana_folder.observability.uid
  overwrite = true
  message   = "Managed by OpenTofu"

  config_json = templatefile("${path.module}/dashboards/api-overview.json.tftpl", {
    api_service_name = jsonencode(var.api_service_name)
    dashboard_title  = jsonencode(var.dashboard_title)
    dashboard_uid    = jsonencode(var.dashboard_uid)
    refresh_interval = jsonencode(var.refresh_interval)
  })
}
