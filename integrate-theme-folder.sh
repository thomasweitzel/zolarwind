#!/usr/bin/env bash
set -euo pipefail

# Integration helper for moving a standalone Zolarwind repo into themes/zolarwind.
# It assumes the repository is in its original standalone layout (fresh checkout).

die() {
  echo "error: $1" >&2
  exit 1
}

info() {
  echo "info: $1"
}

require_path() {
  local path="$1"
  local kind="$2"
  if [[ "$kind" == "file" && ! -f "$path" ]]; then
    die "Expected file '$path' was not found."
  fi
  if [[ "$kind" == "dir" && ! -d "$path" ]]; then
    die "Expected directory '$path' was not found."
  fi
}

# Sanity checks: these paths exist in the standalone layout and are moved or referenced later.
require_path "zola.toml" "file"
require_path "package.json" "file"
require_path "css" "dir"
require_path "i18n" "dir"
require_path "templates" "dir"
require_path "static" "dir"
require_path "static/css" "dir"
require_path "static/giallo-light.css" "file"
require_path "static/giallo-dark.css" "file"
require_path "theme.toml" "file"

if [[ -e "themes/zolarwind" ]]; then
  die "Target directory 'themes/zolarwind' already exists. Remove it or choose a clean working tree."
fi

# Only static/img and static/js move into the theme; static/css and giallo-*.css must stay in the site root.
if [[ ! -d "static/img" || ! -d "static/js" ]]; then
  die "Expected 'static/img' and 'static/js' to exist. Only 'static/css' and 'static/giallo-*.css' should stay in the site root."
fi

info "Creating themes/zolarwind structure."
mkdir -p "themes/zolarwind/static"

info "Moving theme directories and theme.toml."
mv css i18n templates theme.toml "themes/zolarwind/"
mv static/img static/js "themes/zolarwind/static/"

if grep -q './css/main.css' package.json; then
  # Tailwind input must point at the moved css/main.css to keep builds in sync.
  info "Updating Tailwind input paths in package.json."
  sed -i 's@./css/main.css@./themes/zolarwind/css/main.css@g' package.json
else
  info "No package.json Tailwind input update needed."
fi

# Ensure Zola points at the moved theme and language files after relocation.
if grep -q '^theme = ' zola.toml; then
  info "Setting theme = \"zolarwind\" in zola.toml."
  sed -i 's/^theme = .*/theme = "zolarwind"/' zola.toml
elif grep -q '^# theme = ' zola.toml; then
  info "Uncommenting and setting theme = \"zolarwind\" in zola.toml."
  sed -i 's/^# theme = .*/theme = "zolarwind"/' zola.toml
else
  die "No theme entry found in zola.toml. Add 'theme = \"zolarwind\"' manually."
fi

if grep -q 'path_language_resources = "i18n/"' zola.toml; then
  info "Updating path_language_resources to themes/zolarwind/i18n/."
  sed -i 's@path_language_resources = "i18n/"@path_language_resources = "themes/zolarwind/i18n/"@' zola.toml
else
  die "No path_language_resources = \"i18n/\" entry found in zola.toml. Update it manually."
fi

info "Done. Review changes, then rebuild CSS if needed with:"
info "  npm run css:build"
