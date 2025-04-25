#!/bin/bash

# --- Configuration ---
# Path to the APK file to be attached to the release
APK_PATH="./app/build/outputs/apk/release/app-release.apk"
# GitHub repository in the format OWNER/REPO (usually inferred by gh)
# REPO_URL="aario/snotepad" # uncomment and set if gh can't detect it automatically

# --- Set Bash options for robustness ---
# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Pipe commands return the exit status of the last command in the pipe
set -o pipefail

# --- Pre-checks ---
echo "--- Running Pre-checks ---"

# 1. Check if inside a Git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "ERROR: This script must be run from within a Git repository."
  exit 1
fi
echo "✓ Git repository detected."

# 2. Check if the GitHub CLI (gh) is installed
if ! command -v gh &> /dev/null; then
    echo "ERROR: GitHub CLI (gh) not found. Please install it (https://cli.github.com/) and authenticate (gh auth login)."
    exit 1
fi
echo "✓ GitHub CLI (gh) found."

# 3. Check if gh is authenticated
if ! gh auth status > /dev/null 2>&1; then
    echo "ERROR: Not authenticated with GitHub CLI. Please run 'gh auth login'."
    exit 1
fi
echo "✓ GitHub CLI is authenticated."

# 4. Check if the APK file exists
if [ ! -f "$APK_PATH" ]; then
    echo "ERROR: APK file not found at '$APK_PATH'. Please build the release APK first."
    exit 1
fi
echo "✓ APK file found at '$APK_PATH'."

echo "--- Pre-checks completed successfully ---"
echo

# Find the latest tag in the history
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

echo "Last tag found: $LATEST_TAG"
# --- Get Tag Name ---
read -p "Enter the tag name for the new release (e.g., v1.0.0): " TAG_NAME

if [ -z "$TAG_NAME" ]; then
    echo "ERROR: Tag name cannot be empty."
    exit 1
fi

# Check if the tag already exists locally or remotely
if git rev-parse "$TAG_NAME" >/dev/null 2>&1 || git ls-remote --tags origin | grep -q "refs/tags/$TAG_NAME$"; then
    echo "ERROR: Tag '$TAG_NAME' already exists locally or remotely."
    exit 1
fi

echo "Using tag name: $TAG_NAME"
echo

# --- Generate Release Notes ---
echo "--- Generating Release Notes ---"

RELEASE_NOTES=""

if [ -z "$LATEST_TAG" ]; then
    echo "No previous tags found. Generating notes from all commits."
    # If no tags exist, get all commit messages
    RELEASE_NOTES=$(git log --pretty=format:"* %s (%h)")
else
    echo "Generating notes from commits since tag '$LATEST_TAG'."
    # Get commit messages since the last tag
    RELEASE_NOTES=$(git log "${LATEST_TAG}"..HEAD --pretty=format:"* %s (%h)")
fi

if [ -z "$RELEASE_NOTES" ]; then
    echo "Warning: No new commits found since the last tag (or no commits found at all)."
    RELEASE_NOTES="No changes detected."
    exit 1
fi

echo "--- Release Notes Generated ---"
echo "$RELEASE_NOTES"
echo "------------------------------"
echo

# --- Create and Push Git Tag ---
echo "--- Tagging and Pushing ---"
echo "Creating local tag '$TAG_NAME'..."
# Create a lightweight tag pointing to the latest commit
git tag "$TAG_NAME"

echo "Pushing tag '$TAG_NAME' to remote 'origin'..."
# Push the tag to the remote repository
git push origin "$TAG_NAME"
echo "✓ Tag '$TAG_NAME' pushed successfully."
echo

# --- Create GitHub Release ---
echo "--- Creating GitHub Release ---"
echo "Creating release '$TAG_NAME' on GitHub..."

# Use gh release create command
# It automatically uses the tag name for the release title
# -t specifies the title (using tag name again for clarity)
# -n specifies the notes
# The last argument is the file to attach
gh release create "$TAG_NAME" \
    --title "$TAG_NAME" \
    --notes "$RELEASE_NOTES" \
    "$APK_PATH"

# Check the exit status of the gh command
if [ $? -eq 0 ]; then
    echo "✓ GitHub release '$TAG_NAME' created successfully!"
    echo "You can view it at: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)/releases/tag/$TAG_NAME"
else
    echo "ERROR: Failed to create GitHub release."
    # Attempt to clean up the pushed tag if release creation failed
    echo "Attempting to delete remote tag '$TAG_NAME'..."
    git push --delete origin "$TAG_NAME" || echo "Warning: Failed to delete remote tag '$TAG_NAME'. Manual cleanup might be required."
    echo "Attempting to delete local tag '$TAG_NAME'..."
    git tag -d "$TAG_NAME" || echo "Warning: Failed to delete local tag '$TAG_NAME'. Manual cleanup might be required."
    exit 1
fi

echo "--- Script Finished ---"

exit 0
