---
name: Feature request
about: Propose a new feature or enhancement for cap2-fe frontend
title: "[Feature]: short summary"
labels: enhancement
assignees: ""
---

## Summary
A clear and concise description of the feature.

## Problem statement
What problem does this feature solve? Who benefits?

## Proposal
Describe the solution you’d like. Include UX notes, rough UI, or data flow if relevant.

## Out of scope
List items that are explicitly not included in this request.

## Alternatives considered
Describe any alternative solutions or features you’ve considered.

## Risks and assumptions
List potential risks, unknowns, or assumptions.

## Acceptance criteria
Define concrete conditions that must be met to accept this feature.

- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Implementation hints (optional)
Key files, modules, or patterns likely involved:
- App shell and routing: [App.tsx](my-app/src/App.tsx)
- Services/API and models: [config.ts](my-app/src/lib/api/config.ts), [books.ts](my-app/src/lib/api/books.ts), [types.ts](my-app/src/lib/api/types.ts)
- Mock adapter for pre-backend wiring: [mockAdapter.ts](my-app/src/lib/api/mockAdapter.ts)
- Reusable hooks: [useApiCall.ts](my-app/src/hooks/useApiCall.ts:1)
- UI components: [src/components/ui/](my-app/src/components/ui/button.tsx)

## Additional context
Add any other context, screenshots, or references here.

## Checklist (author)
- [ ] I confirmed the PR base for this work should be TranBang (not main)
- [ ] I added initial acceptance criteria
- [ ] I linked related issues/docs if applicable