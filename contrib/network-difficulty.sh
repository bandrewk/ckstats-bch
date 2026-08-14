#!/bin/bash
#
# Writes the current network difficulty to the file getNetworkDifficulty()
# reads, so ckstats never has to ask an external service for it.
#
# Run it periodically, for example every five minutes; see the systemd units
# in the README. The node's RPC credentials stay with the node, ckstats only
# ever reads the resulting file.
#
# Environment:
#   NETWORK_INFO_FILE  output path      (default /var/lib/bch-network/difficulty.json)
#   BITCOIN_CLI        cli binary       (default bitcoin-cli from PATH)
#   BITCOIN_DATADIR    node data dir    (default: let the cli decide)
#
set -euo pipefail

OUT=${NETWORK_INFO_FILE:-/var/lib/bch-network/difficulty.json}
CLI=${BITCOIN_CLI:-bitcoin-cli}
DATADIR=${BITCOIN_DATADIR:-}

mkdir -p "$(dirname "$OUT")"

TMP=$(mktemp "${OUT}.XXXXXX")
trap 'rm -f "$TMP"' EXIT

if [ -n "$DATADIR" ]; then
  "$CLI" -datadir="$DATADIR" getblockchaininfo
else
  "$CLI" getblockchaininfo
fi | python3 -c '
import json, sys, time

info = json.load(sys.stdin)
json.dump(
    {
        "difficulty": info["difficulty"],
        "blocks": info["blocks"],
        "chain": info["chain"],
        "updated": int(time.time()),
    },
    sys.stdout,
)
' > "$TMP"

chmod 0644 "$TMP"

# Rename rather than write in place, so a reader never sees a half-written
# file.
mv "$TMP" "$OUT"
trap - EXIT
