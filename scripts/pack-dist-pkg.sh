#!/usr/bin/env bash
#
# Rebuild dist-pkg/zen-ui-<binding>.tgz — the installable tarballs consumers
# pull straight off this branch.
#
#   ./scripts/pack-dist-pkg.sh              # react + solid (the default set)
#   ./scripts/pack-dist-pkg.sh solid        # just one
#   ./scripts/pack-dist-pkg.sh react solid vanilla
#
# WHY THIS EXISTS
# ---------------
# These packages are not on any registry, and npm cannot install a subdirectory
# of a git repo: `npm i github:owner/zen-ui#dev` reads the REPO ROOT, which is
# this bun monorepo, and dies on `workspace:*`. A committed tarball is the one
# form that works with plain npm, no registry and no auth:
#
#   npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-react.tgz
#   npm i https://raw.githubusercontent.com/Algorisys-Technologies/zen-ui/refs/heads/dev/dist-pkg/zen-ui-solid.tgz
#
# POINT THIS AT THE BRANCH CONSUMERS SHOULD TRACK, and re-point it when the work
# moves. It said `feat/gantt` until that branch merged into `dev`, at which
# point the URL became a snapshot that had quietly stopped moving — the same
# stale-tarball failure this file warns about below, one level up: the app keeps
# installing something that builds fine and is simply old.
#
# The `refs/heads/` prefix is required, not decorative: a branch name containing
# a slash makes `.../zen-ui/feat/gantt/dist-pkg/...` ambiguous and GitHub can
# resolve it to the wrong ref.
#
# The filenames are deliberately UNVERSIONED so consumers' package.json lines
# survive a version bump.
#
# WHY SOLID IS IN THE DEFAULT SET
# -------------------------------
# It was React-only for a long time, which was fine while React was the only
# binding anyone consumed. It stopped being fine the moment a component landed
# in Solid first: the one consumer who needed DocumentViewer and DiffView is a
# Solid app, and the only tarball on the branch contained neither, in a binding
# they do not use. A packer that covers one binding is a packer that is wrong
# every time the work happens somewhere else.
#
# RUN THIS AFTER EVERY CHANGE consumers need. The tarballs are build artifacts
# in git: they do not update themselves, and a stale one fails silently — the
# app keeps building against whatever was last packed and simply lacks the new
# component. The assertions below exist because "it packed" is not "it works".
set -euo pipefail

cd "$(dirname "$0")/.."
root=$(pwd)

bindings=("$@")
if [ ${#bindings[@]} -eq 0 ]; then
  bindings=(react solid)
fi

fail=0

for binding in "${bindings[@]}"; do
  pkgdir="packages/$binding"
  if [ ! -f "$pkgdir/package.json" ]; then
    echo "FAIL: no such binding: $binding" >&2
    exit 1
  fi

  echo ""
  echo "==> $binding: building the library"
  (cd "$pkgdir" && npm run build:lib)

  echo "==> $binding: packing"
  tmp=$(mktemp -d)
  (cd "$pkgdir" && npm pack --pack-destination "$tmp" >/dev/null)

  mkdir -p "$root/dist-pkg"
  out="$root/dist-pkg/zen-ui-$binding.tgz"
  mv "$tmp"/algorisys-zen-ui-"$binding"-*.tgz "$out"

  # ---- assertions -------------------------------------------------------
  # Each of these has a matching failure that shipped, and none of them is
  # visible from a green build. See CLAUDE.md.

  contents=$(tar tzf "$out")
  manifest=$(tar xzOf "$out" package/package.json)

  # `workspace:*` resolves only inside this monorepo. Outside it every installer
  # fails hard, and it once broke tarball, file:, GitHub Packages and git-URL
  # installs at once while every in-repo check stayed green.
  #
  # Only the fields an installer RESOLVES for a dependency are checked:
  # dependencies, peerDependencies, optionalDependencies. `devDependencies` is
  # deliberately excluded — core lives there on purpose (no binding externalises
  # it, so rollup inlines it and it is a build-time dep), and a consumer
  # installing this tarball never reads them. Checking all four fields flags
  # that intended state as a failure, which is how this assertion behaved on its
  # first run.
  #
  # The one exception, worth knowing rather than guarding: `bun add file:<dir>`
  # DOES install a directory's devDependencies, so it trips where npm and both
  # tarball paths do not. Use a tarball or a bundler alias for bun.
  offenders=$(node -e '
    let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const j=JSON.parse(s);
      const bad=[];
      for (const f of ["dependencies","peerDependencies","optionalDependencies"])
        for (const [k,v] of Object.entries(j[f]||{}))
          if (String(v).startsWith("workspace:")) bad.push(`${f}.${k}=${v}`);
      process.stdout.write(bad.join(" "));
    })' <<<"$manifest")
  if [ -n "$offenders" ]; then
    echo "   FAIL: installable deps carry a workspace: range -> $offenders" >&2
    fail=1
  else
    echo "   ok   no workspace: range in any installable dependency field"
  fi

  # npm auto-includes a LICENSE from the package directory only when `files` is
  # ABSENT. Every binding here has one, so an unlisted licence is dropped
  # silently — and the licence's Required Notice names COMMERCIAL.md, so
  # dropping that ships a notice pointing at nothing.
  for f in LICENSE COMMERCIAL.md; do
    if grep -qx "package/$f" <<<"$contents"; then
      echo "   ok   $f is in the tarball"
    else
      echo "   FAIL: $f is missing from the tarball" >&2
      fail=1
    fi
  done

  # The entry the manifest promises must actually be in the archive. Both
  # bindings once shipped a `types` pointing at a file the build never wrote.
  for field in main types; do
    target=$(node -p "((require('$root/$pkgdir/package.json').$field)||'').replace(/^\.\//,'')" 2>/dev/null || echo "")
    if [ -z "$target" ]; then continue; fi
    if grep -qx "package/$target" <<<"$contents"; then
      echo "   ok   $field -> $target is present"
    else
      echo "   FAIL: $field points at $target, which is not in the tarball" >&2
      fail=1
    fi
  done

  version=$(node -p "require('$root/$pkgdir/package.json').version")
  size=$(du -h "$out" | cut -f1)
  files=$(wc -l <<<"$contents")
  echo "==> dist-pkg/zen-ui-$binding.tgz  (v$version, $size, $files files)"

  rm -rf "$tmp"
done

echo ""
if [ "$fail" -ne 0 ]; then
  echo "FAILED — do not commit these tarballs." >&2
  exit 1
fi
echo "all tarballs packed and asserted. Commit and push them for consumers to see the change."
