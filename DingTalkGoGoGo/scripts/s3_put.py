#!/usr/bin/env python3
import argparse
import datetime as dt
import hashlib
import hmac
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def sign(key_bytes: bytes, message: str) -> bytes:
    return hmac.new(key_bytes, message.encode("utf-8"), hashlib.sha256).digest()


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def region_candidates(endpoint: str, configured: str) -> list[str]:
    host = urllib.parse.urlparse(endpoint).hostname or ""
    items: list[str] = []

    def append_unique(*values: str) -> None:
        for value in values:
            item = value.strip()
            if item and item not in items:
                items.append(item)

    if host.endswith("r2.cloudflarestorage.com"):
        append_unique("auto")
    if host.endswith("hi168.com"):
        append_unique("auto", "us-east", "us-east-1")
    append_unique(configured or "us-east-1")
    if host.endswith("r2.cloudflarestorage.com"):
        append_unique("us-east-1")
    return items


def put_object(endpoint: str, bucket: str, key: str, body: bytes, content_type: str, access_key: str, secret_key: str, region: str, unsigned_payload: bool, timeout_seconds: int) -> tuple[int, str]:
    amz_date = dt.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    short_date = amz_date[:8]
    parsed = urllib.parse.urlparse(endpoint)
    host = parsed.netloc
    encoded_key = "/".join(urllib.parse.quote(part, safe="") for part in key.split("/"))
    canonical_uri = f"/{urllib.parse.quote(bucket, safe='')}/{encoded_key}"
    payload_hash = "UNSIGNED-PAYLOAD" if unsigned_payload else sha256_hex(body)
    canonical_headers = (
        f"content-type:{content_type}\n"
        f"host:{host}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amz_date}\n"
    )
    signed_headers = "content-type;host;x-amz-content-sha256;x-amz-date"
    canonical_request = "\n".join([
        "PUT",
        canonical_uri,
        "",
        canonical_headers,
        signed_headers,
        payload_hash,
    ])
    credential_scope = f"{short_date}/{region}/s3/aws4_request"
    string_to_sign = "\n".join([
        "AWS4-HMAC-SHA256",
        amz_date,
        credential_scope,
        sha256_hex(canonical_request.encode("utf-8")),
    ])
    k_date = sign(("AWS4" + secret_key).encode("utf-8"), short_date)
    k_region = sign(k_date, region)
    k_service = sign(k_region, "s3")
    k_signing = sign(k_service, "aws4_request")
    signature = hmac.new(k_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()
    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{credential_scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )
    url = endpoint.rstrip("/") + canonical_uri
    request = urllib.request.Request(url, data=body, method="PUT")
    request.add_header("host", host)
    request.add_header("content-type", content_type)
    request.add_header("x-amz-content-sha256", payload_hash)
    request.add_header("x-amz-date", amz_date)
    request.add_header("Authorization", authorization)
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            return response.status, response.read(256).decode("utf-8", "ignore")
    except urllib.error.HTTPError as error:
        return error.code, error.read(512).decode("utf-8", "ignore")
    except urllib.error.URLError as error:
        return 599, str(error.reason)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--endpoint", required=True)
    parser.add_argument("--bucket", required=True)
    parser.add_argument("--key", required=True)
    parser.add_argument("--file", required=True)
    parser.add_argument("--access-key", required=True)
    parser.add_argument("--secret-key", required=True)
    parser.add_argument("--region", default="us-east-1")
    parser.add_argument("--strict-region", action="store_true")
    parser.add_argument("--allow-short-timeout", action="store_true")
    parser.add_argument("--content-type", default="application/octet-stream")
    parser.add_argument("--timeout-seconds", type=int, default=3600)
    args = parser.parse_args()

    body = Path(args.file).read_bytes()
    last_status = 0
    last_body = ""
    regions = [args.region.strip() or "us-east-1"] if args.strict_region else region_candidates(args.endpoint, args.region)
    effective_timeout = max(1, args.timeout_seconds) if args.allow_short_timeout else max(300, args.timeout_seconds)
    for region in regions:
        for unsigned_payload in (False, True):
            status, response_body = put_object(
                endpoint=args.endpoint,
                bucket=args.bucket,
                key=args.key,
                body=body,
                content_type=args.content_type,
                access_key=args.access_key,
                secret_key=args.secret_key,
                region=region,
                unsigned_payload=unsigned_payload,
                timeout_seconds=effective_timeout,
            )
            if 200 <= status < 300:
                mode = "unsigned" if unsigned_payload else "hashed"
                print(f"uploaded via region={region} payload={mode}", file=sys.stderr)
                return 0
            last_status = status
            last_body = response_body.strip()
            mode = "unsigned" if unsigned_payload else "hashed"
            print(f"upload attempt failed: status={status} region={region} payload={mode} body={last_body[:220]}", file=sys.stderr)
    print(f"upload failed after all attempts: status={last_status} body={last_body[:300]}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
