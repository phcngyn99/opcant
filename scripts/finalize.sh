#!/usr/bin/env bash
# Finalize the opcant branch: clean temp worktrees and merged branches, push
# develop, fast-forward main, push main. Safe to re-run.
#
#   ./scripts/finalize.sh        # asks for confirmation
#   ./scripts/finalize.sh -y     # no prompt
#
# Requires: clean working tree, git auth for origin, develop ahead of origin.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

ASSUME_YES=0
[[ "${1:-}" == "-y" || "${1:-}" == "--yes" ]] && ASSUME_YES=1

say() { printf '\n\033[1m%s\033[0m\n' "$*"; }
warn() { printf '\033[33m%s\033[0m\n' "$*"; }

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

say "Repo:   $REPO_DIR"
say "Branch: $BRANCH"
say "Ahead:  $(git rev-list --count "origin/${BRANCH}..${BRANCH}" 2>/dev/null || echo '?') commit(s)"

if [[ -n "$(git status --porcelain)" ]]; then
  warn "Working tree is dirty. Commit or stash first:"
  git status --short
  exit 1
fi

if [[ $ASSUME_YES -eq 0 ]]; then
  read -r -p "Clean temp worktrees/branches, push develop, fast-forward main? [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
fi

say "1/6 Removing temporary worktrees"
while IFS= read -r wt; do
  [[ -z "$wt" || "$wt" == "$REPO_DIR" ]] && continue
  if [[ -n "$(git -C "$wt" status --porcelain 2>/dev/null)" ]]; then
    warn "skip (uncommitted changes): $wt"
    continue
  fi
  git worktree remove "$wt" && echo "removed $wt"
done < <(git worktree list --porcelain | awk '/^worktree /{print $2}')

say "2/6 Deleting merged feature branches"
for br in $(git branch --format='%(refname:short)' | grep -E '^feature/' || true); do
  if git merge-base --is-ancestor "$br" "$BRANCH"; then
    git branch -d "$br" >/dev/null && echo "deleted $br"
  else
    warn "keep (not merged into $BRANCH): $br"
  fi
done

say "3/6 Fetching and pruning remotes"
git fetch origin --prune
git worktree prune

say "4/6 Pushing $BRANCH"
git push origin "$BRANCH"

say "5/6 Fast-forwarding main"
git checkout main
if ! git merge --ff-only "$BRANCH"; then
  warn "main cannot fast-forward; merge manually."
  git checkout "$BRANCH"
  exit 1
fi
git push origin main

say "6/6 Cleanup"
git checkout "$BRANCH"
TMP_ROOT="${TMPDIR:-/tmp}"
for d in "$TMP_ROOT"/opcant-* "$TMP_ROOT"/opencode-chrome-ann-* "$TMP_ROOT"/chrome-ann-profile*; do
  [[ -e "$d" ]] || continue
  rm -rf "$d" && echo "removed $d"
done

say "Done"
git status -sb
git worktree list
git branch -vv
