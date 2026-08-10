# Hetzner app compute — 2+ VMs behind an always-on LB (CF → LB → Caddy on each VM).

resource "hcloud_ssh_key" "deploy" {
  name       = "${var.project_name}-deploy"
  public_key = var.ssh_public_key
}

# LB first so firewall can lock VM 80/443 to the LB address only.
resource "hcloud_load_balancer" "app" {
  name               = "${var.project_name}-lb"
  load_balancer_type = "lb11"
  location           = var.location

  labels = {
    project = var.project_name
  }
}

locals {
  lb_source_ips = concat(
    ["${hcloud_load_balancer.app.ipv4}/32"],
    hcloud_load_balancer.app.ipv6 != "" ? ["${hcloud_load_balancer.app.ipv6}/128"] : [],
  )
}

resource "hcloud_firewall" "app" {
  name = "${var.project_name}-app"

  rule {
    direction = "in"
    protocol  = "icmp"
    source_ips = [
      "0.0.0.0/0",
      "::/0",
    ]
  }

  rule {
    direction   = "in"
    protocol    = "tcp"
    port        = "22"
    source_ips  = var.ssh_allowed_cidrs
    description = "SSH — set ssh_allowed_cidrs (GH var SSH_ALLOWED_CIDRS) to deploy egress only"
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "80"
    source_ips = local.lb_source_ips
  }

  rule {
    direction  = "in"
    protocol   = "tcp"
    port       = "443"
    source_ips = local.lb_source_ips
  }
}

resource "hcloud_server" "app" {
  count        = var.app_servers
  name         = "${var.project_name}-app-${count.index + 1}"
  server_type  = var.server_type
  location     = var.location
  image        = "ubuntu-24.04"
  ssh_keys     = [hcloud_ssh_key.deploy.id]
  firewall_ids = [hcloud_firewall.app.id]

  labels = {
    project = var.project_name
    role    = "app"
  }

  user_data = templatefile("${path.module}/templates/cloud-init.yaml.tftpl", {
    deploy_path = var.deploy_path
  })

  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}

resource "hcloud_load_balancer_service" "https" {
  load_balancer_id = hcloud_load_balancer.app.id
  protocol         = "tcp"
  listen_port      = 443
  destination_port = 443

  health_check {
    protocol = "tcp"
    port     = 443
    interval = 15
    timeout  = 10
    retries  = 3
  }
}

resource "hcloud_load_balancer_service" "http" {
  load_balancer_id = hcloud_load_balancer.app.id
  protocol         = "tcp"
  listen_port      = 80
  destination_port = 80

  health_check {
    protocol = "tcp"
    port     = 80
    interval = 15
    timeout  = 10
    retries  = 3
  }
}

resource "hcloud_load_balancer_target" "app" {
  count            = var.app_servers
  type             = "server"
  load_balancer_id = hcloud_load_balancer.app.id
  server_id        = hcloud_server.app[count.index].id
  use_private_ip   = false
}
