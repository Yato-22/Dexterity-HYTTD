# Rollback Runbook: Dexterity Viking Dragon-Battle

## Current Production Deployment (Baseline)
- **Deployment ID**: `dpl_9c3b3mfdXVhC4eVxHeHHa94DkCJK`
- **Deployment URL**: `https://dexterity-hyttd-3xqfyc3kj-core-0b60.vercel.app`
- **Production Alias Domain**: `https://dexterity-hyttd.vercel.app`
- **Stable Git Commit**: `d3962f5`
- **Stable Git Tag**: `stable-classic`
- **Firestore Backup Folder**: `backups/2026-10-30T01-34-09-319Z`

---

## Rollback Procedures

### (a) Instant Rollback via Vercel CLI (Promoting Previous Deployment)
To immediately point production back to the stable classic deployment without rebuilding:

```bash
# 1. Alias the stable classic deployment to production
npx vercel alias set dexterity-hyttd-3xqfyc3kj-core-0b60.vercel.app dexterity-hyttd.vercel.app

# 2. Or promote deployment directly by ID
npx vercel rollback dpl_9c3b3mfdXVhC4eVxHeHHa94DkCJK --yes
```

---

### (b) Redeploying from Git Tag `stable-classic`
If a full rebuild and redeploy of the stable classic codebase is required:

```bash
# 1. Fetch tags and checkout the stable-classic tag
git fetch origin --tags
git checkout tags/stable-classic

# 2. Build frontend locally to verify integrity
npm run build

# 3. Deploy directly to Vercel production
npx vercel deploy --prod --yes
```

---

### (c) Restoring Firestore Collections from Backup
To restore `teams`, `registry`, `public`, `dragon`, `feed`, `pool`, and `data/hidden_tests.json` from the baseline backup:

```bash
# Run the automated restore script with the backup timestamp
node scripts/restoreFirestore.js 2026-10-30T01-34-09-319Z
```

