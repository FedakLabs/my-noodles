# OpenTofu state/plan encryption — orthogonal to the backend.
# Passphrase from CI: TF_STATE_PASSPHRASE → TF_VAR_state_passphrase.
# Docs: https://opentofu.org/docs/language/state/encryption/

terraform {
  encryption {
    key_provider "pbkdf2" "prod" {
      passphrase = var.state_passphrase
    }

    method "aes_gcm" "prod" {
      keys = key_provider.pbkdf2.prod
    }

    state {
      method   = method.aes_gcm.prod
      enforced = true
    }

    plan {
      method   = method.aes_gcm.prod
      enforced = true
    }
  }
}
