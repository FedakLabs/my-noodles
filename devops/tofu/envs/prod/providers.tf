provider "hcloud" {
  token = var.hcloud_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Hetzner Object Storage is S3-compatible — use AWS provider with endpoint overrides.
provider "aws" {
  alias  = "hetzner_s3"
  region = var.object_storage_region

  access_key = var.object_storage_access_key
  secret_key = var.object_storage_secret_key

  endpoints {
    s3 = var.object_storage_endpoint
  }

  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_requesting_account_id  = true
  s3_use_path_style           = true
}

provider "tls" {}

# Auth via NEON_API_KEY environment variable (do not commit the key).
provider "neon" {}
