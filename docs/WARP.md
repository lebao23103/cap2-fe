# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start Vite dev server with HMR (default: http://localhost:5173)
- `npm run build` - TypeScript type-check + production build
- `npm run lint` - Run ESLint across codebase
- `npm run preview` - Preview production build locally

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure `VITE_API_BASE_URL` (default: http://localhost:8000)
3. Optional feature flags: `VITE_ENABLE_AI_CHAT`, `VITE_ENABLE_USER_BOOKS`, `VITE_ENABLE_ADMIN_PANEL`

## Architecture Overview

### Tech Stack
- **Framework**: React 18.3 + TypeScript 5.8
- **Build Tool**: Vite 7 with @vitejs/plugin-react (Babel Fast Refresh)
- **Routing**: React Router v6.20
- **Styling**: Tailwind CSS 3.4 with custom design system
- **UI Components**: Radix UI primitives + shadcn/ui patterns
- **API Client**: Axios with JWT interceptors
- **Animations**: Framer Motion 10.16
- **Utilities**: clsx + tailwind-merge for className management

### Project Structure

**`src/pages/`** - Route-level components (17 pages total)
- Public: Home, About, Contact, FAQ, ReadNEx, NoteShare, BookReader, BookQuiz, Create
- Auth: Login, Register, ResetPassword
- Protected: Dashboard, Chatbot, Favorites, ReadingHistory
- Admin: AdminDashboard

**`src/components/`**
- `ui/` - Reusable Radix UI-based primitives (Button, Dialog, Toast, Progress, Accordion, Avatar, DropdownMenu, Label, ScrollArea, Switch, Tabs)
- `molecules/` - Composite components built from UI primitives
- `Layout.tsx` - Main navigation wrapper with auth menu and theme toggle
- `ChatWidget.tsx` - Floating AI chat interface
- `theme-provider.tsx` - Theme context (light/dark/system) via `ThemeProvider`

**`src/contexts/`**
- `AuthContext.tsx` - Central authentication management
  - Exports `useAuth()` hook: login, register, logout, updateUser
  - Exports `ProtectedRoute` component for route guards
  - Manages: user, isAuthenticated, isAdmin, isLoading
  - Integrates toast notifications for auth feedback

**`src/lib/api/`** - Backend integration layer
- `config.ts` - Axios client with JWT token auto-refresh
  - Attaches Bearer tokens automatically
  - Refreshes expired tokens using refresh_token
  - Redirects to /login on auth failure
- `auth.ts`, `books.ts`, `ai.ts`, `user.ts` - API endpoint wrappers

**`src/lib/`**
- `utils.ts` - `cn()` helper for conditional Tailwind classes (clsx + tailwind-merge)
- `animations.ts` - Shared Framer Motion variants (fadeInUp, stagger, slideIn)

### Path Aliases
- `@/*` maps to `src/*` (configured in vite.config.ts and tsconfig)
- **Always use `@/` imports** for internal modules

### Authentication Flow
1. JWT tokens stored in localStorage: `access_token`, `refresh_token`, `user`
2. apiClient auto-attaches tokens to requests via interceptor
3. 401 responses trigger automatic token refresh
4. Failed refresh clears storage and redirects to /login
5. AuthContext provides auth state and methods
6. ProtectedRoute guards authenticated routes, supports `requireAdmin` prop

### Component Patterns
- **Class management**: Use `cn()` utility for conditional Tailwind classes
- **UI primitives**: Leverage Radix UI for accessible components
- **Notifications**: Use `useToast()` hook from `@/components/ui/use-toast`
- **Theming**: Components automatically respect ThemeProvider (light/dark/system)
- **Form validation**: Client-side validation with auth service integration

## Design System (from docs/DESIGN_SYSTEM.md)

### Grid System
**Breakpoints**: Mobile (<768px: 1 col), Tablet (768-1024px: 2 col), Desktop (>1024px: 3-4 col)
- Stats/metrics: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`
- Content cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`
- Forms: `grid-cols-1 md:grid-cols-2 gap-6`
- **Never exceed 4 columns** on XL screens for visual content

### Button Sizes
- `sm` (h-9): Secondary actions, toolbars
- `default` (h-10): Default buttons, forms
- `lg` (h-11): Primary CTAs, form submits
- Custom `h-14`: Hero sections only
- **Do not use custom padding** (py-6, px-8) - use size prop

### Icon Sizes
- `h-3 w-3` (12px): Inline with small text, badges
- `h-4 w-4` (16px): Standard inline, button icons (default)
- `h-5 w-5` (20px): Section headers, navigation
- `h-6 w-6` (24px): Page headers, large buttons
- `h-8 w-8` (32px): Feature displays, empty states

### Card Elevation
- **Level 1** (default): `shadow-sm border border-border` - List items, contained sections
- **Level 2**: `shadow-md border-0` - Interactive cards, hover states
- **Level 3**: `shadow-lg border-0` - Modals, popovers (use sparingly)

### Spacing Rhythm
- Base unit: **8px** (use multiples: 8/16/24/32/48)
- Section spacing: `py-16` (hero sections: `py-24`)
- Card padding: `p-4` (compact) or `p-6` (comfortable)

### Color Semantics
- Blue: Info, links
- Green: Success, completed actions
- Yellow/Amber: Warning, pending actions
- Red: Errors, destructive actions
- Purple: Special features, premium content

## Key Conventions

### Styling
- Tailwind utility-first with custom design tokens
- Mobile-first responsive design
- Dark mode support via CSS variables
- Use `rounded-lg` or `rounded-xl` for card corners

### Accessibility
- All icon-only buttons must have `aria-label`
- Decorative icons must have `aria-hidden="true"`
- Form inputs must have associated labels
- Skip link available (sr-only, focus:visible)

### ESLint Configuration
- TypeScript ESLint with recommended rules
- React Hooks linting (`eslint-plugin-react-hooks`)
- JSX accessibility rules (`eslint-plugin-jsx-a11y`)
- Custom rule: CardTitle exempted from heading-has-content check

## Feature Architecture

### Role-Based Access Control
- User role determined by `user.is_staff` field
- `ProtectedRoute` supports `requireAdmin={true}` prop
- Admin users redirected to /admin after login
- Regular users redirected to /dashboard after login

### AI Integration
- AI chatbot available via `/chatbot` route (protected)
- ChatWidget component available on select pages
- API calls through `src/lib/api/ai.ts`

### Book Features
- BookReader: Reading interface with note-taking dialog and review/rating system
  - Auto-prompts for review when finishing book (100% completion)
  - 5-star rating with interactive hover effects
  - Review submission with validation (min 10 characters)
  - Manual review access via header button
- BookQuiz: Quiz functionality for books
- ReadNEx: Book discovery with filters, search, progress tracking
- Favorites and reading history tracking

## Project Context & Evolution

### Current Status (2025-10-27)
- **Build Status**: ✅ Production-ready (0 TypeScript errors)
- **Overall Progress**: ~90% complete
- **Phase**: 5 of 5 (Polish & Feature Enhancements)
- **Quality**: Professional, polished UI/UX

### Recent Major Work Completed

**Phases 1-4 (Complete)**:
1. **Foundation** - Design system documentation, shared animations, grid standardization
2. **Consistency** - Button/icon sizes, form validation, responsive grids
3. **Mobile & Accessibility** - Viewport fixes, ARIA labels, loading states
4. **Complex Refactors** - Layout architecture cleanup, Dialog component, file validation

**Phase 5 (90% Complete)**:
- ✅ **Auth Pages**: Dramatically improved spacing (40% more compact while maintaining readability)
- ✅ **ReadNEx**: Glass-morphism redesign, simplified hover overlays, smart badge system
- ✅ **BookReader**: UI perfection with 65ch reading column, enhanced typography (line-height 1.85)
- ✅ **Chatbot**: Mobile sidebar, DropdownMenu for mode selector, character counter
- ✅ **Create**: Comprehensive form validation, tab gates, Input component migration
- ✅ **Dashboard**: Reusable BookCard component, improved grid (lg:grid-cols-3 with 2:1 ratio)
- ✅ **Home**: Section spacing standardization, CTA hierarchy improvements

### Design System Evolution

This project has undergone a comprehensive UI/UX overhaul with:
- **Glass-morphism effects**: Backdrop blur, translucent overlays throughout
- **Modern animations**: Subtle scale effects (1.02 not 1.05), smooth transitions (300-500ms)
- **Typography perfection**: Optimal 65ch reading columns, 1.85 line-height for readability
- **Color semantics**: Amber (notes/bookmarks), Purple (learning/quizzes), Rose (favorites)
- **Micro-interactions**: Animated navigation chevrons, hover feedback, progressive disclosure

## Important Notes

### When Making Changes
1. **Respect the design system** - Use standardized sizes, spacing, grids (see `docs/DESIGN_SYSTEM.md`)
2. **Use shared utilities** - `cn()` for classes, shared animations from `@/lib/animations`
3. **Maintain accessibility** - Add ARIA labels, test keyboard navigation
4. **Test responsively** - Check at mobile (375px), tablet (768px), desktop (1440px)
5. **Follow glass-morphism patterns** - Use backdrop-blur with semi-transparent backgrounds
6. **Run lint before committing** - `npm run lint` and verify `npm run build` succeeds

### Common Pitfalls to Avoid
- Don't bypass path aliases (use `@/` not relative paths)
- Don't create inline animations (use shared constants from `@/lib/animations`)
- Don't use custom button padding (py-6, px-8) - use size prop instead
- Don't exceed 4 grid columns on XL screens for content cards
- Don't mix borders with high shadows on cards (use one or the other)
- Don't use aggressive hover scales (use 1.02 not 1.05)
- Don't forget to handle loading/error states in API calls
- Don't use arbitrary icon sizes - stick to h-3, h-4, h-5, h-6, h-8

### Code Quality Standards
- **TypeScript**: Strict mode enabled, all types explicit
- **Imports**: Use type-only imports (`import type`) where appropriate
- **Unused Code**: Remove unused imports and variables (lint will catch these)
- **Framer Motion**: Always nest transitions inside variant states (initial/animate/exit)
- **Ref Forwarding**: Radix Slot components handle refs internally

## Build & Deployment

### Production Build
```bash
npm run build  # TypeScript check + Vite build (~4.5 seconds)
```
- **Bundle Size**: ~661 KB (minified + gzipped: ~197 KB)
- **Modules**: 1,986 transformed
- **Status**: ✅ Zero errors

### Known Considerations
- ⚠️ Chunk size warning (661 KB) - Non-blocking, consider code-splitting for optimization
- ℹ️ Upload progress currently simulated - needs backend integration
- ℹ️ Some advanced BookReader features deferred to future phases

## Documentation References

### Essential Reading
- **Design system**: `docs/DESIGN_SYSTEM.md` - Complete design standards
- **Progress tracking**: `docs/PROGRESS_SUMMARY.md` - Overall project status
- **Change log**: `docs/CHANGELOG.md` - Detailed version history
- **TODO list**: `docs/TODO.md` - Remaining tasks and priorities

### Page-Specific Guides
- **ReadNEx redesign**: `docs/READNEX_REDESIGN.md` - Glass-morphism implementation
- **BookReader perfection**: `docs/BOOKREADER_UI_PERFECTION.md` - Typography & layout details
- **Modern UI system**: `docs/MODERN_UI_DESIGN_SYSTEM.md` - Component library
- **Build fixes**: `docs/BUILD_FIX_SUMMARY.md` - TypeScript error resolution

### Architecture Docs
- **Layout audit**: `docs/LAYOUT_AUDIT.md` - Navigation architecture
- **Phase summaries**: `docs/PHASE_4_SUMMARY.md`, `docs/PHASE_5_SUMMARY.md`
- **Session notes**: `docs/SESSION_SUMMARY.md`, `docs/SESSION_2_SUMMARY.md`
