#!/bin/bash
cd /workspaces/24_hr_receptionist

echo "Checking git status..."
git status

echo "Checking for uncommitted changes..."
git diff --name-only

echo "Checking staged changes..."
git diff --cached --name-only

echo "Attempting to continue rebase if needed..."
if [ -d ".git/rebase-merge" ]; then
    echo "Rebase still active, continuing..."
    git add .
    git rebase --continue
else
    echo "Rebase appears complete"
fi

echo "Attempting to push..."
git push

echo "Done!"