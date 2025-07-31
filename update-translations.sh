#!/usr/bin/env bash

# Try to navigate to src/translations
pushd src/translations || exit 1

# Use `git rev-parse --show-superproject-working-tree` to check if we are in a submodule
is_submodule=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
if [ -z "$is_submodule" ]; then
  echo "Not in a submodule, please check the documentation on how to correctly check out the repository."
  exit 1
fi

# Checkout the main branch
if ! git rev-parse --verify main >/dev/null 2>&1; then
  echo "Main branch does not exist. Please check the repository."
  exit 1
fi

# check if we are on the main branch, if not, switch to it
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "main" ]]; then
  if ! git checkout main; then
    echo "Failed to switch to main branch."
    exit 1
  fi
fi

# Pull the latest changes
pull_output=$(git pull --rebase 2>&1)
if [[ $? -ne 0 ]]; then
  echo "Failed to pull the latest changes: $pull_output"
  exit 1
fi

# check if there were any changes
if [[ -z $(git status --porcelain) ]]; then
  echo "No changes to update."
  exit 0
fi

# go back to the original directory
popd || exit 1

# stage the changes
git add src/translations || exit 1

# Show the status of the changes
git status || exit 1
