#!/usr/bin/env bash
#
# Rebuild dist-pkg/zen-ui-react.tgz — the installable tarball consumers pull
# straight off this branch.
#
# WHY THIS EXISTS
# ---------------
# @algorisys/zen-ui-react is not published to any registry, and npm cannot
# install a subdirectory of a git repo: `npm i github:owner/zen-ui#feat/gantt`
# reads the REPO ROOT, which is this bun monorepo, and dies on `workspace:*`.
# A committed tarball is the one form that works with plain npm, no registry
# and no auth:
#
#   npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/feat/gantt/dist-pkg/zen-ui-react.tgz
#
# The `refs/heads/` prefix is required, not decorative: the branch name contains
# a slash, so `.../zen-ui/feat/gantt/dist-pkg/...` is ambiguous and GitHub can
# resolve it to the wrong ref.
#
# The filename is deliberately UNVERSIONED so consumers' package.json lines
# survive a version bump.
#
# RUN THIS AFTER EVERY CHANGE consumers need. The tarball is a build artifact in
# git: it does not update itself, and a stale one fails silently — the app keeps
# building against whatever was last packed and simply lacks the new component.
set -euo pipefail

cd "$(dirname "$0")/.."
root=$(pwd)

echo "==> building the library"
(cd packages/react && npm run build:lib)

echo "==> packing"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
(cd packages/react && npm pack --pack-destination "$tmp" >/dev/null)

mkdir -p "$root/dist-pkg"
mv "$tmp"/algorisys-zen-ui-react-*.tgz "$root/dist-pkg/zen-ui-react.tgz"

version=$(node -p "require('$root/packages/react/package.json').version")
size=$(du -h "$root/dist-pkg/zen-ui-react.tgz" | cut -f1)
echo "==> dist-pkg/zen-ui-react.tgz  (v$version, $size)"
echo "    commit and push it for consumers to see the change."
