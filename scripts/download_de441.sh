#!/usr/bin/env bash
set -euo pipefail

# Downloads JPL DE441 ASCII chunks into .local/de441/.
# Source index: https://ssd.jpl.nasa.gov/ftp/eph/planets/ascii/de441/
#
# NOTE: These files are very large (many ~292MB each). Downloading the full set can be multiple GB.
#
# Usage:
#   ./scripts/download_de441.sh header
#   ./scripts/download_de441.sh testpo
#   ./scripts/download_de441.sh all

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/.local/de441"
BASE_URL="https://ssd.jpl.nasa.gov/ftp/eph/planets/ascii/de441"

mkdir -p "$OUT_DIR"

download() {
  local name="$1"
  local url="$BASE_URL/$name.441"
  local out="$OUT_DIR/$name.441"

  echo "Downloading $url -> $out"
  curl -fL --retry 3 --retry-delay 2 -o "$out" "$url"
}

case "${1:-}" in
  header)
    download header
    ;;
  testpo)
    download testpo
    ;;
  all)
    # Moon (m) chunks
    for i in $(seq -w 1000 1000 13000); do
      download "ascm${i}"
    done
    # Planet (p) chunks
    for i in $(seq -w 00000 1000 16000); do
      download "ascp${i}"
    done
    download header
    download testpo
    ;;
  *)
    echo "Usage: $0 {header|testpo|all}" >&2
    exit 1
    ;;
esac

echo "Done. Files in: $OUT_DIR"

