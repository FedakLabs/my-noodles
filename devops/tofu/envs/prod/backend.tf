# Local backend — encrypted state is committed to git by CI after apply.
# See ../../../docs/state-backend.md.
#
# Prod apply must run via .github/workflows/tofu.yml (not a laptop).

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
