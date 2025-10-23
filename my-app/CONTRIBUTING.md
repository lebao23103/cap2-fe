# Contributing Guide — cap2-fe (Frontend)

Thank you for contributing to cap2-fe. This guide explains how to set up, code, test, document, and submit changes with high quality and consistency.

Contents
- Prerequisites
- Project setup
- Development workflow
- Branching, commits, and PRs
- Lint, typecheck, tests, and build
- CI and required checks
- Documentation updates
- Code quality and architecture
- Accessibility and performance
- Troubleshooting (Windows)

## Prerequisites
- Node.js 20.x
- Git and GitHub account
- Familiarity with React + TypeScript and Vite

## Project setup
From repository root, the frontend lives in `my-app/`.

Install dependencies:
```
cd my-app
npm ci
```

Useful commands:
- Dev server: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Tests (CI mode): `npm run test -- --run`
- Tests (watch): `npm run test:watch`
- Build: `npm run build`
- Preview: `npm run preview`

## Development workflow
1) Create a topic branch off the target base branch (currently `TranBang` for PRs):
```
git checkout TranBang
git pull
git checkout -b feature/<short-topic-name>
```

2) Implement changes in small commits:
- Keep commits scoped and descriptive
- Update docs when adding features or workflows

3) Verify locally:
```
npm run typecheck
npm run lint
npm run test -- --run
npm run build
```

4) Push your branch:
```
git push -u origin feature/<short-topic-name>
```

5) Open a PR with base set to `TranBang` (not `main`):
- Ensure the PR description summarizes the change
- Link related docs and issues

## Branching, commits, and PRs
- Branch naming: `feature/<topic>`, `fix/<topic>`, `chore/<topic>`
- Commit style: Conventional-ish (e.g., `feat(ui): add accessible button variants`)
- Keep PRs focused and small to ease review

PR checklist:
- Base branch is `TranBang`
- All checks pass (typecheck, lint, tests, build)
- Documentation updated and linked in the PR
- Screenshots for UI changes where applicable
- Accessibility notes for interactive changes

Commit/PR helper text:
- See `docs/COMMIT_MESSAGE.md` for templates and standard phrases

## Lint, typecheck, tests, and build
Scripts are defined in `my-app/package.json`.

Before pushing:
- Typecheck: `npm run typecheck`
- Lint (fix staged): uses lint-staged during commit
- Unit/integration tests: `npm run test -- --run`
- Build: `npm run build` (ensure it succeeds)

Husky pre-commit:
- Automatically runs typecheck, lint, lint-staged, and tests to keep quality high

## CI and required checks
GitHub Actions workflow resides at `.github/workflows/ci.yml` and runs for PRs targeting `TranBang`:
- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run test -- --run`
- `npm run build`
- Uploads build artifact from `my-app/dist`

If checks fail, fix locally and push again. Keep the PR base as `TranBang` to ensure CI triggers.

## Documentation updates
When adding features, workflows, or notable changes:
- Update `docs/INDEX.md` to include or link new documents
- Add detailed notes in:
  - Worklogs: `docs/PR_CI_HUSKY_WORKLOG.md`
  - Overview: `docs/CODEBASE_OVERVIEW.md`
  - Delivery summaries: `docs/DELIVERY_SUMMARY_*.md`

Documentation style:
- Clear headings
- Short summaries up top
- Link to relevant files with relative paths

## Code quality and architecture
Follow the existing architecture:
- App shell: `src/App.tsx` (Suspense, route-level code splitting, router future flags)
- Error boundary and tracking: `src/components/error-boundary.tsx`, `src/lib/errorTracking.ts`
- API and services: `src/lib/api/config.ts`, `src/lib/api/books.ts`, `src/lib/api/types.ts`
- Mock adapter for decoupling: `src/lib/api/mockAdapter.ts`
- Reusable hooks: `src/hooks/useApiCall.ts`, `src/hooks/useFormValidation.ts`, `src/hooks/useFocusTrap.ts`
- UI components and design system: `src/components/ui/*`, `src/lib/designSystem.ts`

Guidelines:
- Prefer typed interfaces over `any`
- Extract shared models to `src/lib/api/types.ts`
- Keep functions small and testable
- Use adapter + `useApiCall` for networked pages
- Propagate loading, error, and empty states consistently

## Accessibility and performance
Accessibility:
- Ensure labels are associated with controls
- Provide keyboard handlers for non-native interactive elements
- Use semantic roles when needed
- Validate basic a11y via tests (jest-axe)

Performance:
- Keep lazy loading for route-level splits
- Avoid unnecessary re-renders
- Consider splitting heavy components
- Future: add performance budgets tracked in CI

## Troubleshooting (Windows)
EPERM unlink errors during `npm ci` can occur if binaries are locked:
- Kill locking processes:
  - `tasklist | findstr /I esbuild.exe`
  - `taskkill /PID <pid> /F`
  - Also check `node.exe` processes: `taskkill /PID <pid> /F`
- Chain commands using CMD if PowerShell rejects `&&`:
  - `cmd /v /c "npm run typecheck && npm run lint && npm run test && npm run build"`

## Questions and support
- Open an issue with a clear title and labels (Bug, Feature, Docs)
- Link your branch and PR; reference relevant docs
- Keep communication short and actionable

Thank you for contributing!