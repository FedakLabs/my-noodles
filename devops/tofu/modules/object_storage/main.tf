# Hetzner Object Storage (S3-compatible) — public shareable objects via CDN prefixes.

resource "aws_s3_bucket" "this" {
  bucket = var.bucket
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = ["s3:GetObject"]
        Resource = [
          "${aws_s3_bucket.this.arn}/products/*",
          "${aws_s3_bucket.this.arn}/files/*",
          "${aws_s3_bucket.this.arn}/misc/*",
        ]
      },
    ]
  })
}
