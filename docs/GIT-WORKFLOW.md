# Git workflow — ExtraCare prototype

**Repo layout:** Product docs at repo root; runnable app in [`prototype/`](../prototype/).

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Always demoable; merge features when AC + map click-through pass |
| `feat/feat-00-foundation` | Marketplace shell, FLOW-00, seed data, demo panel |
| `feat/feat-01-buy` | FEAT-01 — browse, buy, escrow (replaces stub) |
| `feat/feat-02-sell` | FEAT-02 — list from wallet (replaces stub) |

Use one branch per **FEAT** (or per wave if you prefer a single Wave A PR). Branch from up-to-date `main`.

## Merge checklist (per FEAT)

1. Map nodes + key error branches from `features/maps/FEAT-XX-map.md`
2. Acceptance criteria in `features/FEAT-XX.md`
3. [DEMO-CONTROLS.md](./DEMO-CONTROLS.md) still resets without code edits
4. No regressions on earlier FEATs (manual click-through)
5. Optional: update `FEATURES.md` status / changelog

## Run the app

```bash
cd prototype
npm install
npm run dev
```

## Remote (when ready)

Create a private GitHub repo, then:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

Do not commit `.env` or credentials.
