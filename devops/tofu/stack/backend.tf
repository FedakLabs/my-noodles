# State is encrypted by OpenTofu and committed per environment by the infrastructure workflow.
terraform {
  backend "local" {}
}
