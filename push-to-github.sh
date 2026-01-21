#!/bin/bash

# Script to push your project to GitHub
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your actual values

# Step 1: Add the remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Step 2: Stage all changes
git add .

# Step 3: Commit changes
git commit -m "Update project files"

# Step 4: Push to GitHub (master branch)
git push -u origin master

echo "✅ Successfully pushed to GitHub!"
