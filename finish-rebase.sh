#!/bin/bash
cd /workspaces/24_hr_receptionist
git add .
echo "Files staged. Now continuing rebase..."
git rebase --continue
echo "Rebase complete. Pushing changes..."
git push
echo "Push complete!"
