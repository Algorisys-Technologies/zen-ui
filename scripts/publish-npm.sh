#!/usr/bin/env bash
#
# Publish one binding to the public npm registry under @algorisys.
#
#   ./scripts/publish-npm.sh solid              # dry run: everything but the upload
#   ./scripts/publish-npm.sh solid --publish    # the real thing
#
# Dry run is the default and publishing is opt-in on purpose, as in deploy.sh: a
# version on npm is public and permanent — it can never be published again, and
# unpublishing is limited to 72 hours. Run the real publish yourself
# (`! ./scripts/publish-npm.sh solid --publish` from a Claude Code session), so
# npm's one-time-password prompt, if your account has 2FA, reaches you.
#
# WHAT IT PUBLISHES
# The COMMITTED dist-pkg/zen-ui-<binding>.tgz — exactly what pack-dist-pkg.sh
# built and asserted (no workspace: range, LICENSE + COMMERCIAL.md present, main
# and types in the archive) and what the raw-GitHub tarball URL serves. It never
# packs or builds anything itself, so npm and the tarball route cannot drift
# apart, and a release cannot ship a dist nobody checked. Release order:
#   ship:check -> bump -> pack-dist-pkg.sh <binding> -> commit -> this.
#
# `npm publish` inside packages/<binding> is blocked by a prepublishOnly guard in
# its package.json for the same reason; publishing a TARBALL does not run the
# package's lifecycle scripts (measured), which is why this route is unaffected.
#
# Only bindings with `npm: true` in scripts/bindings.mjs may be published.
set -euo pipefail

cd "$(dirname "$0")/.."

say()  { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
ok()   { printf '  ok   %s\n' "$*"; }
warn() { printf '  \033[33mwarn\033[0m %s\n' "$*"; }
die()  { printf '\033[31mFAIL: %s\033[0m\n' "$*" >&2; exit 1; }

BINDING=""
PUBLISH=0
for a in "$@"; do
  case "$a" in
    --publish) PUBLISH=1 ;;
    -h|--help) sed -n '2,27p' "$0"; exit 0 ;;
    -*) die "unknown option: $a" ;;
    *) [ -z "$BINDING" ] && BINDING="$a" || die "one binding at a time" ;;
  esac
done
[ -n "$BINDING" ] || die "usage: ./scripts/publish-npm.sh <binding> [--publish]"

# --- the binding is allowed on npm -----------------------------------------
eval "$(B="$BINDING" node --input-type=module -e '
  import { BINDINGS } from "./scripts/bindings.mjs";
  const b = BINDINGS.find((x) => x.id === process.env.B);
  if (!b) { console.log(`echo "unknown binding: ${process.env.B}" >&2; exit 2`); process.exit(0); }
  console.log(`PKG="${b.pkg}"; DIR="${b.dir}"; NPM="${b.npm ? 1 : 0}"`);
')"
[ "$NPM" = "1" ] || die "$BINDING is not marked \`npm: true\` in scripts/bindings.mjs — it is not published to npm"

TGZ="dist-pkg/zen-ui-$BINDING.tgz"
# What npm is handed. The leading ./ is not cosmetic: npm reads a bare
# `dist-pkg/zen-ui-solid.tgz` as GitHub shorthand (`user/repo`) and tries to
# `git ls-remote ssh://git@github.com/dist-pkg/zen-ui-solid.tgz.git` — the first
# dry run of this script failed exactly that way.
TGZ_ARG="./$TGZ"
say "$PKG from $TGZ  ($([ $PUBLISH = 1 ] && echo PUBLISH || echo dry run))"

# --- the tarball is the committed, checked one ------------------------------
[ -f "$TGZ" ] || die "$TGZ does not exist — run ./scripts/pack-dist-pkg.sh $BINDING"
[ -z "$(git status --porcelain)" ] || die "working tree is dirty — commit first, so what is published matches a commit"
git ls-files --error-unmatch "$TGZ" >/dev/null 2>&1 || die "$TGZ is not committed"
ok "working tree clean; $TGZ committed at $(git log -1 --format=%h -- "$TGZ")"

WANT_VERSION="$(node -p "require('./$DIR/package.json').version")"
manifest="$(tar xzOf "$TGZ" package/package.json)"
GOT_NAME="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).name))' <<<"$manifest")"
GOT_VERSION="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).version))' <<<"$manifest")"
GOT_REGISTRY="$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write((JSON.parse(s).publishConfig||{}).registry||""))' <<<"$manifest")"
[ "$GOT_NAME" = "$PKG" ] || die "tarball is $GOT_NAME, expected $PKG"
[ "$GOT_VERSION" = "$WANT_VERSION" ] || die "tarball is $GOT_VERSION but $DIR/package.json says $WANT_VERSION — repack: ./scripts/pack-dist-pkg.sh $BINDING"
# A tarball packed before publishConfig moved to npm would send this to GitHub
# Packages instead — npm honours the publishConfig INSIDE the tarball.
[ "$GOT_REGISTRY" = "https://registry.npmjs.org/" ] || die "tarball's publishConfig.registry is '${GOT_REGISTRY:-unset}', not npm — repack it"
ok "tarball is $GOT_NAME@$GOT_VERSION, publishConfig -> registry.npmjs.org"

contents="$(tar tzf "$TGZ")"
for f in LICENSE COMMERCIAL.md README.md dist/index.js dist/index.d.ts; do
  grep -qx "package/$f" <<<"$contents" || die "$f is missing from the tarball"
done
ok "LICENSE, COMMERCIAL.md, README.md, dist/index.js, dist/index.d.ts present ($(wc -l <<<"$contents") files, $(du -h "$TGZ" | cut -f1))"

# --- npm side ---------------------------------------------------------------
if npm view "$PKG@$WANT_VERSION" version >/dev/null 2>&1; then
  die "$PKG@$WANT_VERSION is already on npm — a version can never be published twice; bump it"
fi
ok "$PKG@$WANT_VERSION is not on npm yet"

WHO="$(npm whoami 2>/dev/null)" || die "not logged in to npm — run \`npm login\` (the account that owns @algorisys), then retry"
ok "npm account: $WHO"

if git rev-parse -q --verify "refs/tags/$BINDING@$WANT_VERSION" >/dev/null; then
  ok "git tag $BINDING@$WANT_VERSION exists"
elif git rev-parse -q --verify "refs/tags/v$WANT_VERSION" >/dev/null; then
  # Releases up to 13.8.0 were cut for every binding at once and tagged v<version>.
  ok "git tag v$WANT_VERSION exists (a shared, pre-split release)"
else
  warn "no git tag $BINDING@$WANT_VERSION — the release procedure tags before publishing"
fi

# --- publish ----------------------------------------------------------------
if [ "$PUBLISH" != "1" ]; then
  say "npm publish --dry-run"
  npm publish "$TGZ_ARG" --access public --dry-run
  cat <<EOF

Dry run only — nothing was uploaded. To publish $PKG@$WANT_VERSION for real:

  ./scripts/publish-npm.sh $BINDING --publish

EOF
  exit 0
fi

say "npm publish"
npm publish "$TGZ_ARG" --access public

say "Reading it back from the registry"
# The registry is eventually consistent; give it a few tries before calling it.
for i in 1 2 3 4 5 6; do
  latest="$(npm view "$PKG" dist-tags.latest 2>/dev/null || true)"
  [ "$latest" = "$WANT_VERSION" ] && break
  sleep 5
done
[ "$latest" = "$WANT_VERSION" ] || die "published, but npm says latest is '${latest:-nothing}' — check https://www.npmjs.com/package/$PKG"
ok "npm: $PKG latest = $latest"
echo "  https://www.npmjs.com/package/$PKG"
