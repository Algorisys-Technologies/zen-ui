#!/usr/bin/env bash
#
# Build the whole site — landing page + both demos — into one static tree and,
# optionally, publish it to the gh-pages branch.
#
#   ./deploy.sh                 build + verify into dist-site/, publish nothing
#   ./deploy.sh --preview       …and serve it locally the way GH Pages serves it
#   ./deploy.sh --publish       …and push it to the gh-pages branch
#
# Building is the default and publishing is opt-in on purpose: this puts a
# public website on the internet under the company's name, which is not
# something a script should do because you typed its name.
#
# WHAT THE LAYOUT IS
#
#   /zen-ui/                    the landing page   (apps/landing)
#   /zen-ui/builder/            the React demo     (packages/react)
#   /zen-ui/builder-solid/      the Solid demo     (packages/solid)
#   /zen-ui/builder-vanilla/    the vanilla demo   (packages/vanilla)
#
# The demo list is NOT hardcoded here: it comes from scripts/bindings.mjs, the one
# registry. This file used to name react and solid in six places.
#
# The landing page is the root rather than dev-all's hub page: apps/landing's
# own vite config has said so since it was written, and the demos' "← All demos"
# link already resolves one level up from their own base, which lands there. The
# hub is a dev convenience for not running three servers; it has no job here.
#
# WHY EVERY BASE IS PASSED IN
#
# Each app hardcodes its own base ("/", "/builder/", …) in its vite
# configs, which are the right answers only when the site is at the origin root.
# On a project Pages site everything sits under /zen-ui/. Rather than edit three
# configs to hardcode a different wrong answer, the base is a deploy-time input
# (--base, or ZEN_BASE) and the apps read it back through import.meta.env.BASE_URL
# for their router basenames and cross-links.
set -euo pipefail

cd "$(dirname "$0")"

BASE="${ZEN_BASE:-/zen-ui/}"
OUT="dist-site"
BRANCH="${ZEN_PAGES_BRANCH:-gh-pages}"
PUBLISH=0
PREVIEW=0
PREVIEW_PORT="${ZEN_PREVIEW_PORT:-5180}"

while [ $# -gt 0 ]; do
  case "$1" in
    --publish) PUBLISH=1 ;;
    --preview) PREVIEW=1 ;;
    --base) BASE="$2"; shift ;;
    --base=*) BASE="${1#--base=}" ;;
    -h|--help) sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

# A base without both slashes silently produces broken asset URLs rather than an
# error, so normalise instead of trusting the caller to type it right.
[ "${BASE#/}" = "$BASE" ] && BASE="/$BASE"
[ "${BASE%/}" = "$BASE" ] && BASE="$BASE/"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
die() { printf '\033[31mFAIL: %s\033[0m\n' "$*" >&2; exit 1; }

# The bindings, from scripts/bindings.mjs — the one registry. This file used to
# name react and solid in six places, so a third binding could exist, build, and
# never reach the site. `dirs` and `slugs` stay index-aligned.
eval "$(node --input-type=module -e '
  import { BINDINGS } from "./scripts/bindings.mjs";
  const q = (a) => a.map((x) => `"${x}"`).join(" ");
  console.log(`APP_DIRS=(${q(BINDINGS.map((b) => b.dir))})`);
  console.log(`APP_SLUGS=(${q(BINDINGS.map((b) => b.base.replace(/^\//, "")))})`);
  // Longest-first: "builder" is a PREFIX of "builder-solid" and "builder-vanilla".
  const bySlug = BINDINGS.map((b) => b.base.replace(/^\//, "")).sort((a, b) => b.length - a.length);
  // The 404 shim is JS, so it needs a JS array literal, not a bash one.
  console.log(`APPS_JSON=${JSON.stringify(bySlug.map((s) => `"${s}"`).join(","))}`);
')"
[ ${#APP_SLUGS[@]} -gt 0 ] || die "no bindings resolved from scripts/bindings.mjs"

say "Building for base $BASE  (${APP_SLUGS[*]})"

# --- build ------------------------------------------------------------------
# NOTE: these are the DEMO builds. Since ed0fcc9 they write to
# packages/*/dist-demo, NOT dist — dist is the published library — so the
# assemble step below must copy from dist-demo. It did not, and copied a stale
# library build into the site instead; the verify step caught it because the
# asset base was wrong, which is the whole reason that step exists.
# apps/landing still builds to dist: it has no library to collide with.
# Catalogue thumbnails are gitignored and generated, so the published site would
# otherwise ship text-only cards. Generated BEFORE the builds because they land
# in each demo's public/ and are copied at build time. Only for the demos that
# actually have a catalogue — vanilla and web-components' Welcome pages are
# prose, with no component grid to put a picture in.
say "Generating catalogue previews"
node scripts/gen-previews.mjs react solid || die "preview generation failed"

npx --yes vite build apps/landing      --base "$BASE"               --config apps/landing/vite.config.ts
for i in "${!APP_DIRS[@]}"; do
  npx --yes vite build "${APP_DIRS[$i]}" --base "${BASE}${APP_SLUGS[$i]}/" --config "${APP_DIRS[$i]}/vite.config.demo.ts"
done

# --- assemble ---------------------------------------------------------------
say "Assembling $OUT"
rm -rf "$OUT"
mkdir -p "$OUT"
cp -R apps/landing/dist/.      "$OUT/"
for i in "${!APP_DIRS[@]}"; do
  mkdir -p "$OUT/${APP_SLUGS[$i]}"
  cp -R "${APP_DIRS[$i]}/dist-demo/." "$OUT/${APP_SLUGS[$i]}/"
done

# GitHub Pages runs Jekyll unless told not to, and Jekyll drops files and
# directories whose names begin with an underscore. Vite does not emit any
# today, but a dependency's chunk name is not something to bet the deploy on.
touch "$OUT/.nojekyll"

# --- SPA deep links ---------------------------------------------------------
# Pages serves static files: /zen-ui/builder/carousel is not a file, so it 404s.
# Both demos are history-routed SPAs, so every deep link and every refresh on a
# sub-route would break. Pages has exactly one hook for this — a 404.html at the
# site root — so that page has to work out which app was wanted, bounce to that
# app's index.html with the route in a query param, and let a shim inside restore
# the URL before the router boots.
#
# This lives in the deploy script rather than in the apps because it is an
# artifact of one host's routing, not a fact about the components.
say "Writing the SPA fallback"

cat > "$OUT/404.html" <<HTML
<!doctype html>
<meta charset="utf-8">
<title>Redirecting…</title>
<script>
(function () {
  var BASE = "$BASE";
  // Longest first. "builder" is a PREFIX of both "builder-solid" and
  // "builder-vanilla" — the same trap the dev hub's proxy table hit, where a plain
  // prefix match sent every Solid URL to the React server. Matching on the trailing
  // slash is what actually makes it safe; the ordering is belt and braces.
  // Generated from scripts/bindings.mjs, already sorted longest-first.
  var APPS = [$APPS_JSON];
  var path = location.pathname;
  if (path.indexOf(BASE) !== 0) { location.replace(BASE); return; }
  var rest = path.slice(BASE.length);
  for (var i = 0; i < APPS.length; i++) {
    var app = APPS[i];
    if (rest === app || rest.indexOf(app + "/") === 0) {
      var route = rest.slice(app.length) || "/";
      location.replace(BASE + app + "/?p=" + encodeURIComponent(route) + location.hash);
      return;
    }
  }
  // Not a demo route — a genuinely missing page. The landing page is the site.
  location.replace(BASE);
})();
</script>
HTML

# The other half: inside each app, turn ?p=/carousel back into /carousel BEFORE
# the router reads the URL. Injected right after <head>, so it runs ahead of the
# module script rather than racing it.
SHIM='<script>(function(){var m=location.search.match(/[?&]p=([^&]*)/);if(m){var r=decodeURIComponent(m[1]);history.replaceState(null,"",location.pathname.replace(/\/$/,"")+r+location.hash);}})();</script>'
for app in "${APP_SLUGS[@]}"; do
  f="$OUT/$app/index.html"
  [ -f "$f" ] || die "$f is missing — did that app build?"
  python3 - "$f" "$SHIM" <<'PY'
import sys
path, shim = sys.argv[1], sys.argv[2]
html = open(path).read()
assert "<head>" in html, f"{path}: no <head> to inject into"
open(path, "w").write(html.replace("<head>", "<head>\n" + shim, 1))
PY
done

# --- verify -----------------------------------------------------------------
# Every failure mode here is silent: a wrong base still builds, still deploys,
# and only 404s in someone else's browser.
say "Verifying"

check() { if eval "$2"; then printf '  ok   %s\n' "$1"; else die "$1"; fi; }

check "landing index.html exists"        '[ -f "$OUT/index.html" ]'
check "React demo index.html exists"     '[ -f "$OUT/builder/index.html" ]'
check "Solid demo index.html exists"     '[ -f "$OUT/builder-solid/index.html" ]'
check ".nojekyll present"                '[ -f "$OUT/.nojekyll" ]'
check "404.html present"                 '[ -f "$OUT/404.html" ]'

# The assets must be referenced under the deploy base, not the origin root.
check "landing assets use $BASE"         'grep -q "\"${BASE}assets/" "$OUT/index.html" || grep -q "${BASE}assets/" "$OUT/index.html"'
check "React assets use ${BASE}builder/" 'grep -q "${BASE}builder/assets/" "$OUT/builder/index.html"'
check "Solid assets use ${BASE}builder-solid/" 'grep -q "${BASE}builder-solid/assets/" "$OUT/builder-solid/index.html"'

# The base is compiled into the bundle for the router basename and the landing
# page's cross-links. If it is absent, the router will match nothing.
check "React bundle carries the base"    'grep -rqF "${BASE}builder" "$OUT/builder/assets/"'
check "Solid bundle carries the base"    'grep -rqF "${BASE}builder-solid" "$OUT/builder-solid/assets/"'
# NOT grepped for: the landing page builds its demo links at runtime from
# BASE_URL, so the literal "/zen-ui/builder" never appears in the bundle — it is
# `/zen-ui/${app}/` in a template. And grepping for the base alone would pass on
# a wrong base anyway, since the GitHub repo URLs contain "/zen-ui/" too. The
# links are checked for real by scripts/check-site.mjs below.

check "React has the route shim"         'grep -q "p=(\[^&\]\*)" "$OUT/builder/index.html"'
check "Solid has the route shim"         'grep -q "p=(\[^&\]\*)" "$OUT/builder-solid/index.html"'
check "404 knows the base"               'grep -qF "var BASE = \"$BASE\"" "$OUT/404.html"'

# The static checks above only prove the files exist and carry the right base.
# Whether the site actually WORKS — deep links, the 404 bounce, the cross-links,
# the router picking up its basename — is a runtime question, so it gets a
# runtime answer against the real tree served the way Pages serves it.
if node -e 'require.resolve("playwright")' >/dev/null 2>&1; then
  say "Driving the built site"
  ZEN_BASE="$BASE" ZEN_OUT="$OUT" node scripts/check-site.mjs || die "the built site does not work"
else
  echo "  (playwright not installed — skipping the driven site check)"
fi

printf '\n  %s built (%s)\n' "$OUT" "$(du -sh "$OUT" | cut -f1)"

# --- preview ----------------------------------------------------------------
if [ "$PREVIEW" = "1" ]; then
  say "Serving $OUT the way Pages serves it"
  echo "  http://localhost:$PREVIEW_PORT$BASE"
  echo "  Ctrl-C to stop."
  ZEN_BASE="$BASE" ZEN_OUT="$OUT" node scripts/serve-site.mjs "$PREVIEW_PORT"
  exit 0
fi

# --- publish ----------------------------------------------------------------
if [ "$PUBLISH" != "1" ]; then
  cat <<EOF

Nothing was published. To look at it exactly as Pages will serve it:

  ./deploy.sh --preview

To publish to the $BRANCH branch:

  ./deploy.sh --publish

EOF
  exit 0
fi

say "Publishing to $BRANCH"
command -v git >/dev/null || die "git not found"
[ -n "$(git status --porcelain)" ] && die "working tree is dirty — commit or stash first, so the deployed tree matches a commit"

SHA="$(git rev-parse --short HEAD)"
SRC_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
WORKTREE="$(mktemp -d)"
cleanup() { git worktree remove --force "$WORKTREE" 2>/dev/null || true; rm -rf "$WORKTREE"; }
trap cleanup EXIT

# A worktree rather than a checkout: the build output lives outside the repo's
# working tree, so publishing never touches the branch you are on.
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  git worktree add "$WORKTREE" "$BRANCH" 2>/dev/null || git worktree add -b "$BRANCH" "$WORKTREE" "origin/$BRANCH"
else
  say "$BRANCH does not exist yet — creating it with no history"
  git worktree add --detach "$WORKTREE"
  git -C "$WORKTREE" checkout --orphan "$BRANCH"
  git -C "$WORKTREE" rm -rf . >/dev/null 2>&1 || true
fi

# The branch is a build artifact, so it is replaced wholesale. Anything left
# behind from a previous deploy would be served forever.
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$OUT/." "$WORKTREE/"

git -C "$WORKTREE" add -A
if git -C "$WORKTREE" diff --cached --quiet; then
  echo "  no change since the last deploy"
else
  git -C "$WORKTREE" commit -q -m "deploy: $SRC_BRANCH@$SHA"
  git -C "$WORKTREE" push -u origin "$BRANCH"
  echo "  pushed $BRANCH"
fi

cat <<EOF

Published. If this is the first deploy, enable it once:
  Settings → Pages → Source: "Deploy from a branch" → $BRANCH / (root)

  https://algorisys-technologies.github.io${BASE}
EOF
