---
name: git-commit
description: >-
  Git commits and pushes for my-noodles with husky pre-commit (nx fix) and commitlint
  conventional messages. Use when the user asks to commit, push, amend, or write a commit
  message — read configs/commitlint/commitlint.config.mjs and validate with commitlint
  before git commit.
---

# Git commit (my-noodles)

**Rules:** `configs/commitlint/commitlint.config.mjs` (extends conventional commits; header/body ≤ 100 chars; no trailing period on subject).

**Style:** `git log -5 --oneline` for scope/type patterns in this repo (`chore(web)`, `feat(web)`, `chore(api)`, …).

## When to commit

- Only when the user **explicitly** asks (or a user rule overrides). If unclear, ask first.
- Do **not** commit `.env`, credentials, or secrets.

## Workflow (strict order)

### 1. Inspect state (parallel)

```bash
git status
git diff
git diff --staged
git log -5 --oneline
```

### 2. Draft message

Write to `.git/COMMIT_EDITMSG_DRAFT`:

```text
type(optional-scope): subject

optional body — wrap lines at 100 chars
```

### 3. Validate **before** `git commit`

```bash
pnpm exec commitlint --config configs/commitlint/commitlint.config.mjs --edit .git/COMMIT_EDITMSG_DRAFT
```

Fix until exit 0. Pre-commit (`nx affected -t fix`) can pass while commit-msg still fails — always validate first.

### 4. Stage and commit

```bash
git add …
git commit -F .git/COMMIT_EDITMSG_DRAFT
```

On Windows, prefer `-F` over inline `-m` for multi-line messages.

### 5. Push

Only when explicitly asked. Never force-push `main`/`master`.

## Amend (rare)

Only if user requested amend (or pre-commit auto-fixed files after a successful commit), HEAD is yours this session, and commit was not pushed. If hooks failed, never amend — new commit instead.

## Safety

- Never `git config` changes, destructive git, or `--no-verify` unless explicitly requested.
