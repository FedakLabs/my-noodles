# The passphrase is supplied only by CI through TF_VAR_state_passphrase.
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
