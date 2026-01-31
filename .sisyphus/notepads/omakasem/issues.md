# Issues Log

## 2026-02-01: Onboarding Page Route Conflict

- **Issue**: Creating `src/app/(onboarding)/page.tsx` caused a build error "You cannot have two parallel pages that resolve to the same path" because `src/app/(app)/page.tsx` also resolves to `/`.
- **Resolution**: Moved the file to `src/app/(onboarding)/onboarding/page.tsx` so it resolves to `/onboarding`, which aligns with the project structure.

## 2026-02-01: Missing Dependencies

- **Issue**: `lucide-react` was used in imports but not installed.
- **Resolution**: Ran `npm install lucide-react`.

## 2026-02-01: Ghost Convex Imports

- **Issue**: LSP reported errors in `src/app/providers.tsx` regarding Convex, but `src/app/providers` was an empty directory.
- **Resolution**: Removed the empty `src/app/providers` directory. Build passed, confirming `src/app/layout.tsx` does not rely on it.
