# Production state is encrypted by OpenTofu and committed by the CI workflow.
# Never run production apply locally.
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
