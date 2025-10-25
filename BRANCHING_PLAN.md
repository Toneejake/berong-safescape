# Branching Strategy for BFP Berong Project

## Overview
This document outlines the steps to properly commit current changes and create a new feature branch for development work on the floor plan upload functionality, ensuring the main branch remains protected.

## Prerequisites
- Git installed and configured
- Repository cloned from GitHub (https://github.com/sitol2/bfp-berong-backup.git)
- Current working directory is the project root

## Step-by-Step Process

### 1. Check Current Git Status
First, verify what changes exist in your working directory:
```bash
git status
```

This will show:
- Modified files
- Untracked files
- Current branch name

### 2. Stage and Commit Current Changes
Add all changes to the staging area:
```bash
git add .
```

Commit with a descriptive message:
```bash
git commit -m "feat: Save progress on floor plan upload component and simulation integration"
```

### 3. Create and Switch to New Branch
Create a new branch named "feature/floor-plan-upload" from the current branch:
```bash
git checkout -b feature/floor-plan-upload
```

### 4. Push New Branch to GitHub
Push the new branch to the remote repository:
```bash
git push origin feature/floor-plan-upload
```

### 5. Verify Branch Creation
Confirm the branch exists both locally and remotely:
```bash
# List local branches
git branch

# List remote branches
git branch -r

# Show current branch
git rev-parse --abbrev-ref HEAD
```

## Branch Naming Convention
We follow the pattern: `type/name` where type is one of:
- `feature` - New functionality
- `bugfix` - Bug fixes
- `hotfix` - Critical production fixes
- `release` - Release preparation

## Best Practices
1. Always create feature branches from the latest main branch
2. Keep branch names descriptive but concise
3. Regularly sync with main branch to avoid merge conflicts
4. Delete branches after merging to keep repository clean

## Next Steps
After creating the branch:
1. Continue development work on the floor plan upload feature
2. Commit regularly with descriptive messages
3. Push changes to GitHub frequently
4. Create a pull request when ready for review

## Common Git Commands for This Workflow
```bash
# Check status
git status

# View commit history
git log --oneline

# Switch between branches
git checkout main
git checkout feature/floor-plan-upload

# Sync with remote
git fetch origin
git pull origin main

# View differences
git diff