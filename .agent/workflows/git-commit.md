---
description: How to commit and push changes to GitHub
---
# Git Workflow for MegaVX World

## After completing a feature or fix:

// turbo-all
1. Stage all changes:
```bash
git add .
```

2. Commit with descriptive message:
```bash
git commit -m "feat: Brief description" -m "- Detail 1" -m "- Detail 2"
```

3. Push to GitHub:
```bash
git push
```

## Commit Message Prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `style:` - UI/styling changes
- `docs:` - Documentation
- `chore:` - Maintenance tasks

## Repository:
- **URL:** https://github.com/Gunstro/mvxworldtotal
- **Branch:** main

## Notes:
- Always run from: `d:\Software\Wowonder-the-ultimate-php-social-network-platform\Script\megavx-client`
- User prefers AG handles all git operations
- Commit after significant changes, not every small edit
