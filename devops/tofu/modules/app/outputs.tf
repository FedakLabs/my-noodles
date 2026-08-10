output "app_ipv4" {
  description = "App server public IPv4 addresses (deploy/bootstrap SSH targets)"
  value       = [for s in hcloud_server.app : s.ipv4_address]
}

output "origin_ipv4" {
  description = "Address Cloudflare should proxy to (Hetzner LB)"
  value       = hcloud_load_balancer.app.ipv4
}

output "load_balancer_ipv4" {
  description = "Hetzner LB public IPv4"
  value       = hcloud_load_balancer.app.ipv4
}
