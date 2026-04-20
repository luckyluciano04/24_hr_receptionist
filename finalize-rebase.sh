#!/bin/bash
# Complete the rebase process
cd /workspaces/24_hr_receptionist

# Check if rebase is still active
if [ -d ".git/rebase-merge" ]; then
    echo "Cleaning up rebase state..."
    rm -rf .git/rebase-merge
    echo "Rebase state cleaned up"
else
    echo "No active rebase found"
fi

# Check git status
echo "Current git status:"
git status

# Try to push
echo "Attempting to push..."
if git push; then
    echo "Push successful!"
else
    echo "Push failed, checking if we need to pull first..."
    git pull --rebase
    git push
fi