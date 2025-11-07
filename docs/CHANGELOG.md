# Changelog

All notable changes to the Knowly frontend design system and UI improvements will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (2025-10-28 - ChatWidget Modernization)
- ChatWidget: Glass-morphism design with backdrop blur effects
- ChatWidget: Gradient header (emerald → teal) with animated background
- ChatWidget: Bot icon with glow effect in glass container
- ChatWidget: Online status indicator with pulsing green dot
- ChatWidget: Sparkles icon for bot avatar in messages
- ChatWidget: Animated glow effect on floating button
- ChatWidget: Gradient notification dot with bounce animation
- ChatWidget: Smooth typing indicator with staggered bounce

### Changed (2025-10-28 - ChatWidget Modernization)
- ChatWidget: Larger floating button (h-16 w-16) with gradient background
- ChatWidget: Increased widget width from 320px to 384px (w-96)
- ChatWidget: Increased height from 384px to 550px for better chat space
- ChatWidget: Message bubbles now rounded-2xl with improved padding
- ChatWidget: User messages with emerald-teal gradient background
- ChatWidget: Bot messages with glass-morphism (bg-card/50 backdrop-blur-sm)
- ChatWidget: Bot avatar appears next to each message
- ChatWidget: Input field with glass effect and emerald focus ring
- ChatWidget: Send button with gradient (emerald → teal) and rounded-xl
- ChatWidget: Header controls (minimize, close) with hover effects
- ChatWidget: Message spacing increased for better readability
- ChatWidget: Background gradient from-background to-muted/20

### Added (2025-10-28 - NoteShare Enhancements)
- NoteShare: Interactive popover on highlighted text showing note details
- NoteShare: Click highlighted passages to view user notes, quotes, and engagement
- NoteShare: Copy-to-clipboard functionality for quotes (with visual feedback)
- NoteShare: Functional like and comment buttons in note popover
- NoteShare: User avatar, name, and share date in popover header
- NoteShare: Page reference badge in note details
- NoteShare: Hover-to-reveal copy button on quotes

### Changed (2025-10-28 - NoteShare Enhancements)
- NoteShare: Compressed preview dialog header (reduced padding from p-6 to p-4)
- NoteShare: Smaller title size (text-xl instead of text-2xl) for compactness
- NoteShare: Combined book info and "Open Reader" button in single row
- NoteShare: User info condensed to single line with bullet separator
- NoteShare: Smaller avatars (w-6 h-6) and icons for proportional design
- NoteShare: Text truncation on long titles to prevent layout breaks
- NoteShare: Button text shortened ("Open Reader" instead of "Open in Book Reader")
- NoteShare: Preview dialog optimized for more vertical reading space

### Removed (2025-10-28 - NoteShare Enhancements)
- NoteShare: Note card removed from preview dialog scrollable area (was blocking content)
- NoteShare: Tags removed from User Books list view (cleaner layout)

### Added (2025-10-28 - Review & Rating System)
- BookReader: Automatic review prompt when finishing book (100% completion)
- BookReader: Interactive 5-star rating system with hover preview
- BookReader: Review textarea with character counter and validation
- BookReader: Book summary card in review dialog
- BookReader: "Write Review" button in header (appears when book complete)
- BookReader: Review submission with console logging (ready for backend)
- BookReader: One-time review prompt with "Maybe Later" option
- BookReader: Review validation (minimum 10 characters, rating required)

### Changed (2025-10-28 - Review & Rating System)
- BookReader: handlePageChange now triggers review dialog on last page
- BookReader: Header button changes from "Write Review" to "View Review" after submission
- BookReader: Review dialog uses amber/gold theme for ratings
- BookReader: Added hasSubmittedReview state management

### Added (2025-10-27 - Navigation & Footer Modernization)
- Navbar: Glassmorphism effects with enhanced backdrop blur (backdrop-blur-xl)
- Navbar: Subtle gradient overlay (primary/5) for depth
- Navbar: Animated logo with glow effect and rotation on hover
- Navbar: Gradient text effect on logo with color transition
- Navbar: Pill-style navigation menu with muted background container
- Navbar: Active state with background, border, and shadow for nav items
- Navbar: ModernButton components for Sign In and Get Started CTAs
- Navbar: Enhanced shadow-sm on header for subtle elevation
- Navbar: Improved navigation item spacing and font-semibold text
- Footer: Glassmorphism background with backdrop-blur-sm
- Footer: Gradient overlay (from-background/50) for depth
- Footer: Logo with glow effect matching navbar design
- Footer: Structured contact info with icon, label, and value layout
- Footer: Animated dot bullets for quick links with scale and translate effects
- Footer: Bottom divider section with legal links
- Footer: Hover effects on all interactive elements
- Footer: Enhanced spacing and typography hierarchy

### Changed (2025-10-27 - Navigation & Footer Modernization)
- Navbar: Header background opacity improved (bg-background/80)
- Navbar: Border opacity refined (border-border/40) for subtlety
- Navbar: Logo size and spacing adjusted (space-x-3)
- Navbar: Logo icon stroke width increased (2.5) for boldness
- Navbar: Logo gradient enhanced (indigo → purple → cyan)
- Navbar: Navigation container uses rounded-2xl with border and shadow
- Navbar: Active nav items use bg-background with border for "selected" appearance
- Navbar: Hover states use bg-background/50 for smooth transitions
- Navbar: Get Started button uses custom gradient (indigo → purple → cyan)
- Navbar: All nav items wrapped in <span> tags for proper text styling
- Navbar: Replaced legacy Button components with ModernButton for CTAs
- Navbar: Enhanced logo hover effect with scale-[1.02] and rotate-3
- Footer: Background changed from bg-muted/50 to bg-muted/30 with backdrop-blur-sm
- Footer: Border opacity refined to border-border/40
- Footer: Padding increased from py-8 to py-12 for better breathing room
- Footer: Top margin added (mt-20) for visual separation
- Footer: Grid gap increased from gap-8 to gap-12
- Footer: Company logo matches navbar design with gradient
- Footer: Contact info restructured with label/value pairs
- Footer: Quick links use animated bullets instead of plain text
- Footer: All links have smooth hover:text-primary transitions
- Footer: Copyright text split into separate elements with red heart
- Footer: Added Privacy Policy and Terms of Service links in bottom section

### Added (2025-10-27 - BookReader Interactive Features)
- BookReader: Color-coded note highlights (yellow, blue, green, pink)
- BookReader: Edit note functionality with color picker
- BookReader: Delete note with confirmation
- BookReader: Share notes (public/private toggle)
- BookReader: Hover actions (Edit, Share, Delete) on notes
- BookReader: "Add Note" quick button in sidebar header
- BookReader: Scrollable notes panel (max-h-400px)
- BookReader: Click note to navigate to page
- BookReader: Character counter in note dialog
- BookReader: Enhanced empty states with icons
- BookReader: Public note indicator (green share icon)
- BookReader: Gradient "Take Quiz" button

### Added (2025-10-27 - BookReader Redesign)
- BookReader: Glass-morphism header with backdrop blur
- BookReader: Subtle gradient background for depth
- BookReader: Custom amber text selection colors
- BookReader: Extra Large (20px) font size option
- BookReader: Color-coded action buttons (amber bookmarks, rose favorites)
- BookReader: Purple-tinted Quiz button for feature prominence
- BookReader: Visual separator between header elements
- BookReader: Background highlights for notes (amber theme)
- BookReader: Bookmark icons in bookmark list
- BookReader: Refined empty states for notes and bookmarks

### Added (2025-10-27 - ReadNEx Redesign)
- ReadNEx: Glass-morphism effects on cards, badges, and overlays
- ReadNEx: Backdrop blur for modern, depth-filled aesthetic
- ReadNEx: Progress status indicators (✓ complete, → in-progress)
- ReadNEx: Enhanced visual separator for last read date
- ReadNEx: Premium white CTA button with high contrast
- ReadNEx: Vertical stacked hover layout for better mobile UX

### Added (2025-10-27 - Earlier)
- ReadNEx: Dropdown menu for secondary actions (quiz, favorites) in card hover overlay
- ReadNEx: Smart badge priority system showing most relevant status per card
- ReadNEx: Gradient effect on progress overlay (from-transparent to-black/90)
- Chatbot: Mobile sidebar with slide-in drawer and toggle button
- Chatbot: DropdownMenu component for mode selector (replaces native select)
- Chatbot: Character count indicator at 400/500 characters
- Chatbot: Close button for mobile sidebar drawer

### Changed (2025-10-27 - BookReader UI Perfection)
- BookReader: Optimal 65ch reading column width (centered, perfect readability)
- BookReader: Enhanced typography (line-height 1.85, letter-spacing 0.015em)
- BookReader: Justified text with auto-hyphens for book-like appearance
- BookReader: Removed card borders (cleaner floating effect)
- BookReader: Upgraded shadows (shadow-2xl for premium depth)
- BookReader: 12-column grid system (8:4 reading-to-sidebar ratio)
- BookReader: Wider max-width (7xl instead of 6xl)
- BookReader: Animated navigation chevrons (directional feedback)
- BookReader: Current page badge (primary/10 background)
- BookReader: Icon containers with color-coded backgrounds
- BookReader: Hierarchical label+value pairs
- BookReader: Uppercase section headers with tracking
- BookReader: Badge counters with amber theme
- BookReader: Increased notes panel height (500px)
- BookReader: Spacious layout (gap-6 lg:gap-8)
- BookReader: Gradient navigation footer
- BookReader: Responsive button labels (hidden sm:inline)

### Changed (2025-10-27 - BookReader Redesign)
- BookReader: Wider layout (max-w-6xl instead of max-w-4xl)
- BookReader: Glass-morphism on all cards (bg-card/50 backdrop-blur-sm)
- BookReader: Better content padding (p-8 md:p-12)
- BookReader: Improved line-height (1.9) and letter-spacing (0.01em)
- BookReader: Slimmer progress bar (h-1.5)
- BookReader: Refined sidebar card titles (text-base)
- BookReader: Tighter sidebar spacing (space-y-4)
- BookReader: Enhanced note styling (border-l-2, rounded-r-md)
- BookReader: Better bookmark hover effects (amber theme)
- BookReader: Refined navigation controls with pill-shaped page indicator
- BookReader: Responsive grid (lg:3 xl:4 columns)
- BookReader: Dark mode prose styling
- BookReader: Font size menu shows current selection

### Changed (2025-10-27 - ReadNEx Redesign)
- ReadNEx: Card design with glass-morphism (bg-card/50 backdrop-blur-sm)
- ReadNEx: Softer aesthetics (rounded-2xl, subtle borders)
- ReadNEx: Refined hover scale (1.02 instead of 1.05) for elegance
- ReadNEx: Better aspect ratio (2:3 for standard book proportion)
- ReadNEx: Smoother image zoom (scale-105, duration-500)
- ReadNEx: Rich multi-stop gradients for progress overlay
- ReadNEx: Enhanced badge styling (glass effect, borders, shadows)
- ReadNEx: Improved typography hierarchy (font-medium, leading-tight)
- ReadNEx: Better spacing and padding throughout cards
- ReadNEx: Refined metadata with smaller icons (h-3.5)
- ReadNEx: Responsive grid (1 col mobile, 2-3 tablet, 4 desktop)
- ReadNEx: Vertical hover layout for mobile optimization
- ReadNEx: White CTA button (higher contrast than gradient)

### Changed (2025-10-27 - Earlier)
- ReadNEx: Simplified hover overlay to single primary action button with dropdown
- ReadNEx: Consolidated badges from 4+ per card to maximum 2 (genre + status)
- ReadNEx: Larger primary action button (size="lg") for better mobile UX
- Chatbot: Increased book recommendation spacing (mb-3 → mb-4)
- Chatbot: Improved sidebar responsiveness for all screen sizes

### Removed (2025-10-27)
- ReadNEx: Unused getStatusBadge function
- ReadNEx: Multiple overlapping status badges (now uses priority system)
- Create: Native HTML input elements (replaced with Input component)

---

## Create Page Enhancements (2025-10-27)

### Added
- Comprehensive form validation with real-time error messages
- Character counter for description field (minimum 50 characters)
- Tab validation gates preventing navigation with incomplete data
- Red border indicators for fields with validation errors
- Helper text showing completion requirements
- validateForm() function checking all required fields

### Changed
- Replaced native `<input>` elements with Input component throughout
- Enhanced Continue button with validation check before tab change
- Improved error feedback with inline validation messages
- Year validation: must be between 1000 and current year + 1
- Description validation: minimum 50 characters required
- Publishing now validates entire form before proceeding

### Improved
- User experience with clear validation feedback
- Form consistency using shadcn/ui Input component
- Error prevention by catching issues before submission

### Design System Review Completed - 2025-10-26

#### Identified Issues

**Critical (Must Fix)**
- Duplicate header components in Dashboard, AdminDashboard, and Chatbot pages conflict with Layout component
- ReadNEx book grid uses 5 columns at XL breakpoint causing cards to become too narrow
- Modal dialogs lack proper backdrop handling and accessibility features
- Create page missing file upload validation (type, size, progress)

**High Priority (Consistency & UX)**
- Button sizes inconsistent across pages (py-2, py-3, py-6 used arbitrarily)
- Icon sizing lacks clear hierarchy (h-3 through h-8 used without pattern)
- Grid breakpoint patterns differ across pages creating inconsistent responsive behavior
- Chatbot fixed height calculation breaks with mobile keyboards
- Form validation errors cause layout shift (no reserved space)

**Medium Priority (Polish)**
- Animation variants duplicated across multiple page files
- Card elevation patterns inconsistent (shadow-sm, shadow-md, shadow-lg, border-0 mixed)
- Color semantics not documented (blue, green, yellow, red used without clear meaning)
- Async operations lack loading indicators in some areas
- Accessibility gaps (missing ARIA labels, focus management)

#### Planned Improvements

See [TODO.md](./TODO.md) for complete task breakdown organized by priority weeks.

---

## [Unreleased] - 2025-10-27

### Added
- [x] Animation constants file (`src/lib/animations.ts`) with shared motion variants
- [x] Design system documentation (`DESIGN_SYSTEM.md`)
- [x] File upload validation with size limits and type checking
- [x] Progress indicators for async operations
- [x] Accessibility improvements (ARIA labels, keyboard navigation)
- [x] Comprehensive spacing documentation (SPACING_REFERENCE.md)

### Changed
- [x] Removed duplicate headers from Dashboard, AdminDashboard, Chatbot
- [x] Standardized grid breakpoints: mobile (1 col), tablet (2 col), desktop (3-4 col)
- [x] Updated button sizing to consistent scale: sm/md/lg/xl
- [x] Updated icon sizing to consistent scale: xs/sm/md/lg/xl
- [x] Improved modal/dialog backdrop handling with blur and click-outside
- [x] Fixed Chatbot viewport handling for mobile keyboards
- [x] Reserved space for form validation errors to prevent layout shift
- [x] Dramatically improved Register and Login page spacing for better visual balance
- [x] Reorganized documentation into docs/ folder

### Fixed
- [x] ReadNEx grid capped at 4 columns to maintain card readability
- [x] Password input toggle buttons have safe zone (no text overlap)
- [x] Message bubbles responsive on mobile devices
- [x] Book cover images use aspect ratio for consistent sizing
- [x] **All TypeScript build errors resolved (57 → 0)**
  - [x] Fixed framer-motion Variants type compatibility in animations.ts
  - [x] Fixed book-button.tsx ref forwarding and asChild logic
  - [x] Fixed vintage-card.tsx motion.div type conflicts
  - [x] Removed 30+ unused imports across pages
  - [x] Fixed type-only imports (ReactNode, Book types)
  - [x] Fixed use-toast.ts missing count variable

### Deprecated
- [x] Inline animation definitions in favor of shared constants
- [ ] Hardcoded shadow classes in favor of elevation system (ongoing)

---

## Version History Template

## [X.Y.Z] - YYYY-MM-DD

### Added
- New features, components, or pages added to the project

### Changed
- Changes to existing functionality, styling, or behavior

### Fixed
- Bug fixes, layout issues, or broken functionality

### Removed
- Features, components, or code that was removed

### Security
- Security-related fixes or improvements

---

## Maintenance Notes

### How to Update This File

1. **After completing a task from TODO.md:**
   - Move the item from TODO.md checkbox to appropriate CHANGELOG section
   - Add date when completing a group of related tasks
   - Check off the checkbox in Unreleased section

2. **When releasing a version:**
   - Change `[Unreleased]` to version number and date: `[1.1.0] - 2025-11-15`
   - Create new `[Unreleased]` section for ongoing work
   - Update version numbers in package.json

3. **Commit message format:**
   - `feat: description` - new features
   - `fix: description` - bug fixes
   - `refactor: description` - code restructuring
   - `style: description` - formatting, styling changes
   - `docs: description` - documentation updates
   - `chore: description` - maintenance tasks

### Version Numbering

- **Major (X.0.0)**: Breaking changes to API or significant UI overhaul
- **Minor (x.Y.0)**: New features, components, or significant improvements
- **Patch (x.y.Z)**: Bug fixes, minor styling adjustments, performance improvements

---

## Design Review History

### 2025-10-26 - Initial Design System Audit
**Reviewer**: Senior UX Architect  
**Scope**: All core pages (Home, Login, Register, Dashboard, ReadNEx, Chatbot, BookReader, Create, AdminDashboard, NoteShare)  
**Files Reviewed**: 10 page components, ~6,500 lines of TSX  
**Issues Identified**: 53 major tasks across 4 priority levels  
**Documentation Created**: TODO.md, CHANGELOG.md, WARP.md  

**Key Findings:**
- Strong component architecture with modern React patterns
- Good use of Radix UI primitives and Tailwind CSS
- Needs design system consolidation (buttons, icons, grids)
- Mobile responsiveness requires refinement in several areas
- Accessibility improvements needed (ARIA, keyboard nav)

**Priority Focus:**
1. Week 1: Layout architecture, grid standardization, modal patterns, validation
2. Week 2: Button/icon consistency, responsive grids, mobile keyboard handling
3. Week 3: Shared constants, elevation system, color semantics, accessibility
4. Week 4+: Page-specific improvements and feature enhancements

---

## Contact

For questions about design decisions or to report UI/UX issues:
- Create an issue in the project repository
- Reference specific line numbers and page names
- Include screenshots or screen recordings when possible
- Tag with `design-system` or `ui-ux` labels
