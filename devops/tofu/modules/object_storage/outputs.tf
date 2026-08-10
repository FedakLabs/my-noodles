output "bucket" {
  description = "Object Storage bucket name."
  value       = aws_s3_bucket.this.bucket
}

output "bucket_arn" {
  description = "Object Storage bucket ARN (provider-specific format)."
  value       = aws_s3_bucket.this.arn
}
