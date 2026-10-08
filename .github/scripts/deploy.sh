#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'Deployment error: %s\n' "$1" >&2
  exit 1
}

for deploy_setting in DEPLOY_HOST DEPLOY_USER DEPLOY_PATH DEPLOY_SSH_KEY DEPLOY_KNOWN_HOSTS; do
  [[ -n "${!deploy_setting:-}" ]] || fail "Configure $deploy_setting in GitHub Actions settings."
done

deploy_port="${DEPLOY_PORT:-22}"
deploy_source="${1:-dist}"
[[ "$DEPLOY_HOST" =~ ^[A-Za-z0-9][A-Za-z0-9.-]*$ ]] || fail 'DEPLOY_HOST must be a hostname or IPv4 address.'
[[ "$DEPLOY_USER" =~ ^[A-Za-z_][A-Za-z0-9_-]*$ ]] || fail 'DEPLOY_USER is not a valid SSH username.'
[[ "$deploy_port" =~ ^[0-9]{1,5}$ ]] || fail 'DEPLOY_PORT must be a number between 1 and 65535.'
(( 10#$deploy_port >= 1 && 10#$deploy_port <= 65535 )) || fail 'DEPLOY_PORT must be between 1 and 65535.'
[[ "$DEPLOY_PATH" =~ ^/[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)*/?$ ]] || fail 'DEPLOY_PATH must point to a dedicated absolute website directory without spaces or shell characters.'
[[ "$DEPLOY_PATH/" != *'/../'* && "$DEPLOY_PATH/" != *'/./'* ]] || fail 'DEPLOY_PATH must not contain . or .. directory segments.'
deploy_path="${DEPLOY_PATH%/}"
[[ -f "$deploy_source/index.html" ]] || fail 'Build the site first: dist/index.html is missing.'

umask 077
ssh_dir="$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/cloverta-deploy.XXXXXX")"
trap 'rm -rf -- "$ssh_dir"' EXIT

printf '%s\n' "$DEPLOY_SSH_KEY" | tr -d '\r' > "$ssh_dir/id_ed25519"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" | tr -d '\r' > "$ssh_dir/known_hosts"
ssh-keygen -y -P '' -f "$ssh_dir/id_ed25519" > /dev/null || fail 'DEPLOY_SSH_KEY must be a valid private key without a passphrase.'

cat > "$ssh_dir/config" <<EOF
Host cloverta-deploy
  HostName $DEPLOY_HOST
  User $DEPLOY_USER
  Port $deploy_port
  IdentityFile "$ssh_dir/id_ed25519"
  IdentitiesOnly yes
  UserKnownHostsFile "$ssh_dir/known_hosts"
  GlobalKnownHostsFile /dev/null
  StrictHostKeyChecking yes
  BatchMode yes
  ConnectTimeout 20
EOF

ssh -F "$ssh_dir/config" cloverta-deploy "mkdir -p -- '$deploy_path'"

rsync \
  --archive \
  --compress \
  --no-owner \
  --no-group \
  --chmod=D755,F644 \
  --delay-updates \
  --protect-args \
  --rsh="ssh -F \"$ssh_dir/config\"" \
  -- \
  "$deploy_source/" "cloverta-deploy:$deploy_path/"

printf 'Static website uploaded successfully.\n'
