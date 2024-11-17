#!/bin/bash

# Save as version.sh in your repository root
VERSION=$1
MESSAGE=$2

if [ -z "$VERSION" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: ./version.sh <version> <message>"
    echo "Example: ./version.sh 1.0.0 'Initial release'"
    exit 1
fi

# Make sure we're on main branch
git checkout main

# Create version tag
git tag -a "v$VERSION" -m "$MESSAGE"

# Create or update latest tag
git tag -f latest -m "Latest version $VERSION"

# Push changes
git push origin "v$VERSION"
git push -f origin latest