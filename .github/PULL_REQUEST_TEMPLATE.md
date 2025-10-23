# Pull Request Template — cap2-fe

Please use this template to structure your PR targeting TranBang.

## PR type
- [ ] feat
- [ ] fix
- [ ] chore
- [ ] docs
- [ ] refactor
- [ ] test

## Summary
Describe what this PR does and why.

## Linked issues
Closes #...

## Base branch
- [ ] Base is TranBang (not main)

## Screenshots
Attach screenshots or clips for UI changes.

## Implementation details
Key files changed (include paths):
- ...

## Testing plan
Describe manual/automated tests performed.
- [ ] npm run typecheck
- [ ] npm run lint
- [ ] npm run test -- --run
- [ ] npm run build

## CI status
Confirm GitHub Actions workflow [.github/workflows/ci.yml](.github/workflows/ci.yml:1) passed on this PR.
- [ ] Frontend CI green

## Accessibility checklist
- [ ] Labels associated with controls
- [ ] Keyboard handlers for interactive elements
- [ ] No obvious axe violations in core pages tests

## Documentation updates
- [ ] Updated [INDEX.md](my-app/docs/INDEX.md:1) if new docs were added
- [ ] Added or updated worklogs/overviews:
  - [PR_CI_HUSKY_WORKLOG.md](my-app/docs/PR_CI_HUSKY_WORKLOG.md)
  - [CODEBASE_OVERVIEW.md](my-app/docs/CODEBASE_OVERVIEW.md)

## Breaking changes
- [ ] None
- [ ] Yes (explain migration below)

### Migration notes
If breaking changes, document required steps.

## Reviewer checklist (for maintainers)
- [ ] Base = TranBang
- [ ] CI checks passed
- [ ] Husky pre-commit intact [pre-commit](my-app/.husky/pre-commit:1)
- [ ] Docs updated
- [ ] A11y considerations addressed
- [ ] Scope appropriate for review

## Post-merge
- [ ] Delete remote feature branch (if applicable)
- [ ] Consider tagging release and updating docs

Thank you for your contribution.