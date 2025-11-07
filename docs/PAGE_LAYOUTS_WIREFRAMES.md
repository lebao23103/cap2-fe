# Page Layouts & Wireframes - Knowly Frontend

**Last Updated**: 2025-11-02  
**Purpose**: Detailed wireframe and layout recommendations for each major page  
**Policy**: Reuse existing components, minimal new file creation

---

## 🎨 DESIGN SYSTEM COMPONENTS AVAILABLE

### Core UI Components (Radix-based)
- **Layout**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- **Navigation**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `DropdownMenu`
- **Forms**: `Input`, `Textarea`, `Label`, `Button`
- **Feedback**: `Badge`, `Progress`, `Toast`, `Dialog`, `Popover`, `Spinner`
- **Data Display**: `Avatar`, `ScrollArea`, `Accordion`

### Modern Custom Components
- **`ModernButton`** - Enhanced button with variants: primary, secondary, ghost, outline
- **`StatCard`** - Statistics card with icon, label, value (variants: primary, success, warning, info)
- **`SectionHeader`** - Consistent section headers
- **`BookCard`** (molecules) - Book display with variants: default, compact, detailed, 3d
- **`GlassCard`** - Glassmorphic card (variants: default, gradient, aurora, light)
- **`PremiumButton`** - Aurora-effect button
- **`VintageCard`** - Vintage-styled card

### Layout Utilities
- **`Layout`** - Global navigation wrapper (header, footer, mobile menu)
- **`ThemeProvider`** - Dark/light mode
- **`AnimatedBackground`** - Background effects

---

## 📄 PAGE-BY-PAGE WIREFRAMES

### 1. DASHBOARD PAGE ✅ (Current: Good structure, needs data connection)

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (Header with navigation, user dropdown)                   │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-4 py-8                                      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Welcome Section                                             │ │
│  │ - Heading: "Welcome back, [Name]! 👋"                       │ │
│  │ - Subtext: "Discover your next favorite book..."           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────┬──────────────────────────┬────────┐│
│  │ Quick Action Button      │ Quick Action Button      │ ...    ││
│  │ [Icon] Continue Reading  │ [Icon] My Favorites      │        ││
│  └──────────────────────────┴──────────────────────────┴────────┘│
│                                                                    │
│  ┌─────────────────────────────────────┬─────────────────────────┐│
│  │ MAIN CONTENT (2/3 width)            │ SIDEBAR (1/3 width)     ││
│  │                                     │                         ││
│  │ SectionHeader: "Recommended for You"│ Card: Continue Reading  ││
│  │ ┌─────────────────────────────────┐│ - BookCard (sm) x2-3    ││
│  │ │ BookCard (md) - Horizontal      ││                         ││
│  │ │ [Cover] [Title, Author, Genre]  ││ Card: My Favorites      ││
│  │ │         [Rating] [CTA Button]   ││ - BookCard (sm) x2-3    ││
│  │ └─────────────────────────────────┘│                         ││
│  │ ... (repeat 3-5 books)              │                         ││
│  │                                     │                         ││
│  │ [View More Recommendations Button]  │                         ││
│  └─────────────────────────────────────┴─────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- ✅ `Button` for quick actions
- ✅ `BookCard` (size="md" for main, size="sm" for sidebar)
- ✅ Layout (global navigation)

**Layout Improvements**:
- ✅ Current grid: `lg:grid-cols-3` (2:1 ratio) - GOOD
- ✅ Quick actions use `min-h-20` - GOOD
- ✅ Responsive: stacks on mobile
- 🔧 **Add**: Empty state component when no recommendations
- 🔧 **Add**: Skeleton loaders while fetching data
- 🔧 **Enhance**: Use `StatCard` for reading stats (books read this week, streak, etc.)

**Suggested Enhancement**:
```
Add Stats Row before Quick Actions:
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ StatCard     │ StatCard     │ StatCard     │ StatCard     │
│ Books Read   │ Reading Time │ Current      │ Reading      │
│ 12 this month│ 4h 30m       │ Streak: 7d   │ Goal: 75%    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Missing Components** (describe only, no creation):
- **EmptyStateCard**: Centered illustration + text when no data
  - Props: `icon`, `title`, `description`, `actionButton?`
  - Use for: no recommendations, no favorites, etc.

---

### 2. FAVORITES PAGE ⚠️ (Needs modernization)

**Current Issues**:
- Custom inline `BookCard` component (should use reusable one)
- Native `select` for genre filter (should use `DropdownMenu`)
- Good: Has search, filter, empty state logic

```
┌──────────────────────────────────────────────────────────────────┐
│ Header Section (border-b bg-card)                                │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [← Back] [❤️ My Favorites]              12 of 15 books       │ │
│ └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-4 py-8                                      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Search & Filter Bar                                         │ │
│  │ ┌────────────────────────────┬─────────────────────────────┐│ │
│  │ │ [🔍] Search input          │ [Filter] Genre Dropdown     ││ │
│  │ └────────────────────────────┴─────────────────────────────┘│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Favorites Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) │ │
│  │                                                             │ │
│  │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │
│  │ │ BookCard     │  │ BookCard     │  │ BookCard     │      │ │
│  │ │ - Cover      │  │ - Cover      │  │ - Cover      │      │ │
│  │ │ - Title      │  │ - Title      │  │ - Title      │      │ │
│  │ │ - Author     │  │ - Author     │  │ - Author     │      │ │
│  │ │ - Rating     │  │ - Rating     │  │ - Rating     │      │ │
│  │ │ - Genres     │  │ - Genres     │  │ - Genres     │      │ │
│  │ │ - [Remove]   │  │ - [Remove]   │  │ - [Remove]   │      │ │
│  │ └──────────────┘  └──────────────┘  └──────────────┘      │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [OR if empty]                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ EmptyState                                                  │ │
│  │ [❤️ Icon]                                                   │ │
│  │ "No favorites yet"                                          │ │
│  │ "Start building your collection"                           │ │
│  │ [Browse Books Button]                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Badge`, `Button`, `Input`
- ⚠️ Should use `BookCard` (molecules) instead of custom inline
- ⚠️ Should use `DropdownMenu` instead of native select

**Layout Improvements**:
- 🔧 **Replace**: Custom inline BookCard → Use `BookCard` component with variant="default"
- 🔧 **Replace**: Native `<select>` → `DropdownMenu` from shadcn
- 🔧 **Add**: View toggle (Grid/List view) using `Tabs`
- 🔧 **Add**: Sort options (Date added, Rating, Title)
- 🔧 **Enhance**: Add bulk actions (Select multiple, Remove all selected)

**Recommended Refactor**:
```tsx
// Replace lines 107-145 with:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredFavorites.map((book) => (
    <BookCard
      key={book.id}
      book={book}
      variant="default"
      isFavorited={true}
      onFavorite={() => handleRemoveFavorite(book.id)}
      onReadMore={() => navigate(`/book/${book.id}`)}
    />
  ))}
</div>
```

---

### 3. READING HISTORY PAGE ⚠️ (Needs modernization, similar to Favorites)

```
┌──────────────────────────────────────────────────────────────────┐
│ Header Section (border-b bg-card)                                │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ [← Back] [📖 Reading History]                                │ │
│ └──────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-4 py-8                                      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Stats Overview (grid-cols-4)                                │ │
│  │ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │ │
│  │ │ StatCard    │ StatCard    │ StatCard    │ StatCard    │  │ │
│  │ │ Total Books │ Completed   │ Pages Read  │ Avg Progress│  │ │
│  │ │ 24          │ 18          │ 4,532       │ 65%         │  │ │
│  │ └─────────────┴─────────────┴─────────────┴─────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Filter Tabs                                                 │ │
│  │ [All] [Reading] [Completed] [Paused]                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Reading Sessions List (space-y-4)                           │ │
│  │                                                             │ │
│  │ ┌──────────────────────────────────────────────────────────┐│ │
│  │ │ Card: Reading Session                                    ││ │
│  │ │ ┌────┐ [Title]                          [Status Badge]   ││ │
│  │ │ │Cvr │ [Author]                                          ││ │
│  │ │ │Img │ Progress: ████████░░ 75% (135/180 pages)          ││ │
│  │ │ └────┘ Started: Jan 15  |  Last read: Jan 20  |  ⭐ 4/5 ││ │
│  │ │        [Continue Reading] [View Details]                 ││ │
│  │ └──────────────────────────────────────────────────────────┘│ │
│  │ ... (repeat)                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Badge`, `Button`, `Progress`
- ✅ `StatCard` for overview stats
- ✅ `Tabs` for filtering

**Layout Improvements**:
- 🔧 **Add**: Stats overview using `StatCard` (currently missing)
- 🔧 **Add**: Calendar view toggle option
- 🔧 **Add**: Export reading report button
- 🔧 **Enhance**: Add reading streak visualization
- 🔧 **Add**: Time spent reading per book

---

### 4. ADMIN DASHBOARD ⚠️ (Needs complete modernization)

**Current Issues**:
- Good structure with tabs
- Needs real data integration
- Should use modern components consistently

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (admin-specific header if needed)                         │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-4 py-8                                      │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Page Title                                                  │ │
│  │ [Activity Icon] Admin Dashboard                             │ │
│  │ "Manage users, content, and platform settings"              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Overview Stats (grid-cols-4)                                │ │
│  │ ┌─────────────┬─────────────┬─────────────┬─────────────┐  │ │
│  │ │ StatCard    │ StatCard    │ StatCard    │ StatCard    │  │ │
│  │ │ Total Users │ Total Books │ Reviews     │ Pending     │  │ │
│  │ │ 1,247       │ 89          │ 3,421       │ 12          │  │ │
│  │ │ +12% ↑      │ +5% ↑       │ +18% ↑      │ -3 ↓        │  │ │
│  │ └─────────────┴─────────────┴─────────────┴─────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Tabs Component                                              │ │
│  │ [Overview] [Users] [Books] [Reviews] [Moderation]          │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB: OVERVIEW                                         ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Charts & Analytics                                    ║  │ │
│  │ ║ - User growth graph (Line chart)                      ║  │ │
│  │ ║ - Popular books (Bar chart)                           ║  │ │
│  │ ║ - Activity heatmap                                    ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB: USERS                                            ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Search & Filter Bar                                   ║  │ │
│  │ ║ [🔍 Search] [Role Filter] [Status Filter] [+ Add User]║ │ │
│  │ ║                                                        ║  │ │
│  │ ║ Data Table                                            ║  │ │
│  │ ║ ┌────────────────────────────────────────────────────┐║  │ │
│  │ ║ │Name      │Email         │Role  │Status │Actions  │║  │ │
│  │ ║ ├────────────────────────────────────────────────────┤║  │ │
│  │ ║ │John Doe  │john@...      │User  │Active │[⋮]      │║  │ │
│  │ ║ │Jane S.   │jane@...      │Admin │Active │[⋮]      │║  │ │
│  │ ║ └────────────────────────────────────────────────────┘║  │ │
│  │ ║ [Pagination controls]                                 ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB: MODERATION                                       ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Pending Book Submissions (grid-cols-2)                ║  │ │
│  │ ║ ┌────────────────────┐  ┌────────────────────┐        ║  │ │
│  │ ║ │ Card               │  │ Card               │        ║  │ │
│  │ ║ │ [Preview]          │  │ [Preview]          │        ║  │ │
│  │ ║ │ Title, Author      │  │ Title, Author      │        ║  │ │
│  │ ║ │ Submitted by: ...  │  │ Submitted by: ...  │        ║  │ │
│  │ ║ │ [✓ Approve]        │  │ [✓ Approve]        │        ║  │ │
│  │ ║ │ [✗ Reject]         │  │ [✗ Reject]         │        ║  │ │
│  │ ║ └────────────────────┘  └────────────────────┘        ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `StatCard` (enhance with trend indicators)
- ✅ `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- ✅ `Card`, `Badge`, `Button`, `DropdownMenu`
- ✅ `Progress` for stats

**Layout Improvements**:
- 🔧 **Add**: Proper data table component (currently using custom markup)
- 🔧 **Add**: Confirmation dialogs for destructive actions
- 🔧 **Add**: Toast notifications for action feedback
- 🔧 **Enhance**: Use semantic colors (blue=users, green=content, yellow=pending, red=issues)
- 🔧 **Add**: Pagination controls for tables
- 🔧 **Add**: Real-time updates indicator

**Missing Components** (describe only):
- **DataTable**: Sortable, filterable table
  - Props: `columns`, `data`, `onSort`, `onFilter`, `pagination`
  - Features: Row selection, bulk actions, export
  - Styling: Matches design system
  
- **ConfirmDialog**: Reusable confirmation modal
  - Props: `title`, `description`, `onConfirm`, `onCancel`, `variant` (danger, warning, info)
  - Use for: Delete user, reject book, etc.

---

### 5. BOOK READER PAGE ⚠️ (Needs major implementation)

**Current State**: Has basic structure but core PDF rendering missing

```
┌──────────────────────────────────────────────────────────────────┐
│ Minimal Header (auto-hide on scroll)                             │
│ [← Exit] [Book Title] [Page 5/180] [⚙️ Settings] [✕ Close]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌─────────┬────────────────────────────────────────┬──────────┐  │
│ │ TOC     │                                        │ Tools    │  │
│ │ Sidebar │     MAIN READING AREA                  │ Sidebar  │  │
│ │ (280px) │                                        │ (320px)  │  │
│ │         │     [PDF PAGE CONTENT]                 │          │  │
│ │ Ch 1    │                                        │ 🔖       │  │
│ │ Ch 2 ✓  │     "In my younger and more            │ Bookmarks│  │
│ │ Ch 3    │      vulnerable years..."              │          │  │
│ │         │                                        │ 📝       │  │
│ │         │                                        │ My Notes │  │
│ │         │                                        │ - Note 1 │  │
│ │         │                                        │ - Note 2 │  │
│ │         │                                        │          │  │
│ │         │                                        │ ✏️       │  │
│ │ [Toggle]│                                        │ Colors   │  │
│ │ [Close] │                                        │ 🟡🔵🟢🟣 │  │
│ │         │                                        │          │  │
│ │         │                                        │ [Toggle] │  │
│ │         │                                        │ [Close]  │  │
│ └─────────┴────────────────────────────────────────┴──────────┘  │
│                                                                    │
│ Bottom Controls (always visible)                                  │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ [◀️ Prev] [Page: 5 / 180] [▶️ Next]   [A- A A+] [🔍] [💾]  │   │
│ │ Progress: ████░░░░░░░░░░░░ 2.5%                            │   │
│ └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Button`, `Textarea`, `Dialog`, `Popover`, `ScrollArea`
- ✅ `Progress` for reading progress
- ✅ `DropdownMenu` for settings

**Layout Improvements**:
- 🔧 **Implement**: PDF.js or react-pdf integration for actual rendering
- 🔧 **Add**: Collapsible sidebars (toggle buttons)
- 🔧 **Add**: Floating toolbar on text selection
- 🔧 **Add**: Keyboard shortcuts (arrows, bookmarks, etc.)
- 🔧 **Enhance**: Auto-save reading position
- 🔧 **Add**: Reading statistics (time, words per minute)

**Critical Missing Feature**:
- PDF rendering library integration (react-pdf recommended)
- Text layer for selection/annotation
- Page caching for performance

**Sidebar Layouts**:

**Left Sidebar (TOC)**:
```
┌─────────────────────┐
│ 📚 Table of Contents│
├─────────────────────┤
│ ☑️ Chapter 1        │ ← Completed
│   Introduction      │
│                     │
│ → Chapter 2         │ ← Current
│   The Beginning     │
│                     │
│ ☐ Chapter 3         │ ← Not started
│   Rising Action     │
│                     │
│ [Collapse/Expand]   │
└─────────────────────┘
```

**Right Sidebar (Tools)**:
```
┌──────────────────────┐
│ 🔖 Bookmarks (3)     │
├──────────────────────┤
│ • Page 5 - Important │
│ • Page 12 - Quote    │
│ • Page 24 - Review   │
│                      │
│ 📝 My Notes (5)      │
├──────────────────────┤
│ Page 5: "profound..." │
│ [Edit] [Delete] [📤] │
│                      │
│ ✏️ Highlight Color   │
├──────────────────────┤
│ 🟡 Yellow (default)  │
│ 🔵 Blue              │
│ 🟢 Green             │
│ 🟣 Pink              │
└──────────────────────┘
```

---

### 6. BOOK DETAIL PAGE ❌ (MISSING - TOP PRIORITY)

**Must Create**: This is the critical missing link between discovery and reading

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (Header with navigation)                                  │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-6 py-8                                      │
│                                                                    │
│ [← Back to Library]                                               │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Hero Section (grid-cols-3)                                  │ │
│  │                                                             │ │
│  │ ┌──────────┐  ┌────────────────────────────────────────┐   │ │
│  │ │          │  │ The Great Gatsby                        │   │ │
│  │ │  Book    │  │ By F. Scott Fitzgerald                  │   │ │
│  │ │  Cover   │  │                                          │   │ │
│  │ │  Image   │  │ ⭐⭐⭐⭐⭐ 4.5 (234 reviews)            │   │ │
│  │ │  Large   │  │                                          │   │ │
│  │ │  350x500 │  │ Genre: Classic, Fiction                 │   │ │
│  │ │          │  │ Pages: 180  |  Language: English        │   │ │
│  │ └──────────┘  │ Published: 1925                          │   │ │
│  │               │                                          │   │ │
│  │               │ Description:                             │   │ │
│  │               │ The Great Gatsby is a 1925 novel by...   │   │ │
│  │               │                                          │   │ │
│  │               │ ┌──────────────┬──────────────┐         │   │ │
│  │               │ │[🚀 Start     │[📝 Take Quiz]│         │   │ │
│  │               │ │  Reading]    │              │         │   │ │
│  │               │ └──────────────┴──────────────┘         │   │ │
│  │               │                                          │   │ │
│  │               │ [❤️ Add to Favorites] [📤 Share]        │   │ │
│  │               └────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Tabs: [Reviews] [About Book] [Related Books]               │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB: REVIEWS (234 reviews)                            ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ [Write Review Button]                                 ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ Rating Distribution:                                  ║  │ │
│  │ ║ 5⭐ ████████████████████ 156 (67%)                    ║  │ │
│  │ ║ 4⭐ ████████░░░░░░░░░░░░ 52  (22%)                    ║  │ │
│  │ ║ 3⭐ ███░░░░░░░░░░░░░░░░░ 18  (8%)                     ║  │ │
│  │ ║ 2⭐ █░░░░░░░░░░░░░░░░░░░ 5   (2%)                     ║  │ │
│  │ ║ 1⭐ ░░░░░░░░░░░░░░░░░░░░ 3   (1%)                     ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ Reviews:                                              ║  │ │
│  │ ║ ┌────────────────────────────────────────────────────┐║  │ │
│  │ ║ │ [Avatar] John Doe - 2 days ago     ⭐⭐⭐⭐⭐      │║  │ │
│  │ ║ │ "Amazing book! The prose is beautiful and..."      │║  │ │
│  │ ║ │ [👍 Helpful (12)] [Report]                         │║  │ │
│  │ ║ └────────────────────────────────────────────────────┘║  │ │
│  │ ║ ... (more reviews)                                    ║  │ │
│  │ ║ [Load More]                                           ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB: RELATED BOOKS                                    ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Same Author  |  Same Genre  |  Recommended            ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      ║  │ │
│  │ ║ │BookCard│  │BookCard│  │BookCard│  │BookCard│      ║  │ │
│  │ ║ └────────┘  └────────┘  └────────┘  └────────┘      ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Badge`, `Button`, `Tabs`, `Avatar`, `Progress`
- ✅ `BookCard` for related books
- ✅ `Dialog` for write review modal

**New Components Needed** (describe only):
- **ReviewCard**: Display individual review
  - Props: `author`, `rating`, `date`, `content`, `helpful_count`
  - Actions: Mark helpful, report
  
- **RatingDistribution**: Visual rating breakdown
  - Props: `ratings` object with 1-5 star counts
  - Display: Horizontal bars with percentages

- **WriteReviewModal**: Dialog for submitting review
  - Form: Star rating selector, textarea, submit button
  - Validation: Require rating, min 50 chars

**Critical API Connections**:
- `GET /api/books/:id/` - Book details
- `GET /api/books/:id/reviews/` - Reviews
- `POST /api/books/:id/add_review/` - Submit review
- `POST /api/favorites/add_to_favorites/` - Add to favorites
- `GET /api/books/author/:author/` - Related books

---

### 7. CHATBOT PAGE ✅ (Good structure, needs backend)

**Current**: Well-designed UI with collapsible sidebar, good mobile support

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (Header)                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Container mx-auto px-4 py-6                                      │
│                                                                    │
│ ┌──────────┬──────────────────────────────────────────────────┐  │
│ │ Sidebar  │ Chat Area                                        │  │
│ │ (280px)  │                                                  │  │
│ │          │ [Role Selector Dropdown]                         │  │
│ │ Modes:   │                                                  │  │
│ │ • Book   │ ┌────────────────────────────────────────────┐  │  │
│ │   Advisor│ │ Chat Messages (scroll area)                │  │  │
│ │ • Lit.   │ │                                            │  │  │
│ │   Expert │ │ [AI Message Bubble - left aligned]         │  │  │
│ │ • Reader │ │ [User Message Bubble - right aligned]      │  │  │
│ │   Buddy  │ │                                            │  │  │
│ │          │ │ [Book Recommendation Card in message]      │  │  │
│ │ Tips:    │ │                                            │  │  │
│ │ - Ask    │ │ ... (conversation history)                 │  │  │
│ │   for... │ │                                            │  │  │
│ │          │ │ [Typing indicator...]                      │  │  │
│ │          │ └────────────────────────────────────────────┘  │  │
│ │ History: │                                                  │  │
│ │ (future) │ ┌────────────────────────────────────────────┐  │  │
│ │          │ │ Input Area                                 │  │  │
│ │          │ │ [Textarea - auto-resize]                   │  │  │
│ │          │ │ [Character count: 0/500]                   │  │  │
│ │ [Close]  │ │ [Send Button →]                            │  │  │
│ │          │ └────────────────────────────────────────────┘  │  │
│ └──────────┴──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Button`, `Textarea`, `DropdownMenu`, `ScrollArea`
- ✅ Collapsible sidebar (mobile-friendly)

**Layout Improvements**:
- ✅ Already modernized with DropdownMenu
- ✅ Character counter added
- ✅ Mobile sidebar drawer working
- 🔧 **Add**: Conversation history in sidebar (save/load)
- 🔧 **Add**: Export conversation button
- 🔧 **Add**: Suggested prompts/quick replies
- 🔧 **Enhance**: Streaming response animation

---

### 8. BOOK QUIZ PAGE ❌ (INCOMPLETE - Needs implementation)

**Current State**: Route exists but page is placeholder

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (Minimal header)                                          │
│ [← Exit Quiz] Quiz: The Great Gatsby                             │
├──────────────────────────────────────────────────────────────────┤
│ Container max-w-3xl mx-auto px-6 py-8                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Progress Bar                                                │ │
│  │ Question 8 of 10    ████████░░ 80%       ⏱️ 02:34          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Question Card                                               │ │
│  │                                                             │ │
│  │ Question 8: Multiple Choice                                 │ │
│  │                                                             │ │
│  │ What is the symbolic meaning of the green light             │ │
│  │ in the novel?                                               │ │
│  │                                                             │ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ ○ A. Hope and dreams                                    ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ ○ B. Wealth and materialism                             ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ ○ C. Jealousy and envy                                  ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ ○ D. Nature and environment                             ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  │                                                             │ │
│  │ [Previous] [Skip Question] [Submit Answer]                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [OR AFTER COMPLETION]                                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Results Card                                                │ │
│  │                                                             │ │
│  │ 🎉 Congratulations!                                         │ │
│  │                                                             │ │
│  │ Your Score: 8/10 (80%)                                      │ │
│  │                                                             │ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ Circular Progress: 80%                                  ││ │
│  │ │ [Performance Graph]                                     ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  │                                                             │ │
│  │ Correct: 8   Wrong: 2   Skipped: 0                          │ │
│  │                                                             │ │
│  │ Time Taken: 5 minutes 12 seconds                            │ │
│  │                                                             │ │
│  │ [Review Answers] [Retake Quiz] [Back to Book]              │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Button`, `Progress`, `Badge`
- ✅ Radio buttons (custom styled)

**New Components Needed** (describe only):
- **QuizQuestion**: Single question display
  - Types: Multiple choice, true/false, short answer
  - Props: `question`, `options`, `type`, `onAnswer`
  
- **QuizResults**: Results summary
  - Display: Score, time, breakdown, review option
  - Props: `score`, `total`, `time`, `answers`

**Missing**: Backend quiz endpoints need to be created

---

### 9. CREATE PAGE ✅ (Good structure, needs backend upload)

**Current**: Good multi-step form with tabs, needs real upload

```
┌──────────────────────────────────────────────────────────────────┐
│ Layout (Header)                                                   │
├──────────────────────────────────────────────────────────────────┤
│ Container max-w-4xl mx-auto px-6 py-8                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Header                                                      │ │
│  │ [✍️] Create a Book                                          │ │
│  │ "Share your knowledge with the community"                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Tabs: [Book Info] [Content Upload] [Preview]               │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB 1: BOOK INFO                                      ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Form Fields:                                          ║  │ │
│  │ ║ - Title (Input) *                                     ║  │ │
│  │ ║ - Author (Input) *                                    ║  │ │
│  │ ║ - Description (Textarea) * min 50 chars               ║  │ │
│  │ ║ - Genre (Select/Dropdown)                             ║  │ │
│  │ ║ - Language (Select)                                   ║  │ │
│  │ ║ - Publication Year (Input)                            ║  │ │
│  │ ║ - Tags (Tag input)                                    ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ Validation: Real-time error display                   ║  │ │
│  │ ║ [Next: Upload Content →]  (disabled if invalid)       ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB 2: CONTENT UPLOAD                                 ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Cover Image:                                          ║  │ │
│  │ ║ ┌────────────────────────────────────────────────────┐║  │ │
│  │ ║ │ [Drop zone for image]                              │║  │ │
│  │ ║ │ Or click to browse                                 │║  │ │
│  │ ║ │ Max 5MB, JPG/PNG                                   │║  │ │
│  │ ║ └────────────────────────────────────────────────────┘║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ Book File:                                            ║  │ │
│  │ ║ ┌────────────────────────────────────────────────────┐║  │ │
│  │ ║ │ [Drop zone for PDF]                                │║  │ │
│  │ ║ │ Or click to browse                                 │║  │ │
│  │ ║ │ Max 50MB, PDF only                                 │║  │ │
│  │ ║ └────────────────────────────────────────────────────┘║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ [← Back] [Next: Preview →]                            ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  │                                                             │ │
│  │ ╔═══════════════════════════════════════════════════════╗  │ │
│  │ ║ TAB 3: PREVIEW & PUBLISH                              ║  │ │
│  │ ╠═══════════════════════════════════════════════════════╣  │ │
│  │ ║ Preview Card:                                         ║  │ │
│  │ ║ ┌────────────────────────────────────────────────────┐║  │ │
│  │ ║ │ [Cover] [Title, Author, Genre]                     │║  │ │
│  │ ║ │ Description preview...                             │║  │ │
│  │ ║ └────────────────────────────────────────────────────┘║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ ⚠️ Important:                                         ║  │ │
│  │ ║ Your book will be reviewed by admins before           ║  │ │
│  │ ║ being published to the platform.                      ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ [← Back] [🚀 Publish Book]                            ║  │ │
│  │ ║                                                        ║  │ │
│  │ ║ [Upload Progress: ████████░░ 75%]  (when uploading)   ║  │ │
│  │ ╚═══════════════════════════════════════════════════════╝  │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**Reusable Components**:
- ✅ `Card`, `Input`, `Textarea`, `Button`, `Tabs`, `Progress`
- ✅ Form validation working

**Layout Improvements**:
- ✅ Tab validation gates working
- ✅ Real-time validation
- 🔧 **Implement**: Actual file upload to backend
- 🔧 **Add**: Drag-and-drop file upload
- 🔧 **Add**: Image preview before upload
- 🔧 **Add**: Success confirmation page after submission

---

## 🔧 REUSABLE COMPONENTS & INTEGRATION NOTES

### Components to Reuse Across Pages

#### ✅ Already Used Well
1. **BookCard** (molecules/BookCard.tsx)
   - Variants: default, compact, detailed, 3d
   - Use in: Dashboard, Favorites, ReadNEx, Search Results, Book Detail (related)
   - **Action**: Already well-integrated in Dashboard

2. **StatCard** (ui/modern/StatCard.tsx)
   - Variants: primary, success, warning, info
   - Use in: Dashboard (stats row), Reading History (overview), Admin Dashboard
   - **Action**: Add to Reading History page

3. **ModernButton** (ui/modern/ModernButton.tsx)
   - Use for: Primary CTAs, hero sections
   - **Action**: Already used in key pages

#### ⚠️ Needs Better Integration
4. **Card** + **CardHeader** + **CardContent**
   - Universal container
   - **Action**: Standardize all page sections to use Card wrapper

5. **Tabs** Component
   - Use in: Admin Dashboard ✅, Book Detail (needs creation), User Profile (future)
   - **Action**: Implement in Book Detail page

6. **DropdownMenu**
   - Replace all native `<select>` elements
   - **Action**: Update Favorites page genre filter

7. **Dialog**
   - Use for: Confirmations, Write Review, Add Note
   - **Action**: Create ConfirmDialog wrapper for destructive actions

#### 🔧 Components Needing Creation (Describe Only)

8. **EmptyState** Component
   - **Purpose**: Consistent empty state across all lists
   - **Props**: `icon` (Lucide icon), `title`, `description`, `action?` (button)
   - **Usage**: Favorites (no books), Reading History (no books), Search (no results)
   - **Design**: Centered layout with muted icon, heading, text, optional CTA
   - **File**: No new file needed - can be inline functional component pattern

9. **DataTable** Component
   - **Purpose**: Admin dashboard user/book tables
   - **Features**: Sortable headers, row selection, pagination, bulk actions
   - **Props**: `columns`, `data`, `onSort`, `onRowSelect`, `pagination`
   - **Design**: Striped rows, hover states, sticky header
   - **Alternative**: Consider using existing table libraries (TanStack Table)

10. **ConfirmDialog** Component
   - **Purpose**: Consistent confirmation for destructive actions
   - **Props**: `title`, `description`, `variant` (danger/warning), `onConfirm`, `onCancel`
   - **Usage**: Delete user, reject book, remove favorite
   - **Design**: Modal dialog with red accent for danger
   - **Implementation**: Wrapper around existing Dialog component

11. **ReviewCard** Component
   - **Purpose**: Display user reviews on Book Detail page
   - **Props**: `author`, `avatar`, `rating`, `date`, `content`, `helpful_count`
   - **Actions**: Mark helpful, report, reply (future)
   - **Design**: Avatar left, content right, actions below

12. **LoadingState** / **SkeletonLoader**
   - **Purpose**: Loading placeholders for data fetching
   - **Variants**: BookCard skeleton, List skeleton, Stats skeleton
   - **Usage**: All pages during data load
   - **Design**: Animated pulse effect, match actual component dimensions

---

## 🎨 AI DESIGN RECOMMENDATIONS

### Global Layout Consistency

#### ✅ What's Working Well
1. **Design System Cohesion**
   - Glassmorphic cards with backdrop blur
   - Consistent spacing rhythm (4, 6, 8, 12, 16, 24 units)
   - Modern gradient accents
   - Dark/light mode support

2. **Component Hierarchy**
   - Clear Card-based structure
   - Proper use of headings (h1, h2, h3)
   - Good icon-text pairing

3. **Responsive Patterns**
   - Mobile-first grid systems
   - Collapsible navigation
   - Stacked layouts on small screens

#### 🔧 Areas for Improvement

### 1. Spacing & Rhythm
**Current Issues**:
- Inconsistent padding between pages (some py-6, some py-8, some py-12)
- Card spacing varies (gap-4, gap-6, gap-8)

**Recommendations**:
```
Standardize:
- Page container: px-4 md:px-6 py-8
- Section spacing: space-y-8 or space-y-12
- Card grids: gap-6 (default), gap-4 (compact lists)
- Internal card padding: p-6 (standard), p-4 (compact)
```

### 2. Typography Hierarchy
**Current**: Good but can be enhanced

**Recommendations**:
```
- Page title: text-3xl font-bold
- Section heading: text-xl font-semibold
- Card title: text-lg font-semibold
- Card description: text-sm text-muted-foreground
- Body text: text-base
- Small text: text-sm
- Micro text: text-xs
```

### 3. Color Semantics
**Current**: Needs standardization for status indicators

**Recommendations**:
```
Status Colors (use consistently):
- Blue: Informational, users, ongoing
- Green: Success, completed, approved
- Yellow: Warning, pending, in-review
- Red: Error, danger, rejected
- Purple: Premium, featured, special

Badge Variants:
- default: muted gray
- success: green
- warning: yellow
- destructive: red
- info: blue
```

### 4. Interactive States
**Current**: Good hover effects, needs consistency

**Recommendations**:
```
All interactive elements should have:
- Hover: scale-102 or shadow-lg transition
- Active: scale-98
- Focus: ring-2 ring-primary/20
- Disabled: opacity-50 cursor-not-allowed

Timing:
- All transitions: duration-200 or duration-300
- Use ease-in-out for most, ease-out for exit
```

### 5. Loading States
**Current**: Mostly missing

**Recommendations**:
```
Add loading states to:
✅ Dashboard - Show skeleton while fetching recommendations
✅ Favorites - Show skeleton cards while loading
✅ Reading History - Show skeleton list
✅ Admin Dashboard - Show skeleton for stats/tables
✅ Book Detail - Show skeleton for reviews
✅ Chatbot - Typing indicator already present ✓

Pattern:
<div className="space-y-4">
  {isLoading ? (
    <>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </>
  ) : (
    // Actual content
  )}
</div>
```

### 6. Empty States
**Current**: Some pages have them, inconsistent

**Recommendations**:
```
Every list/collection needs empty state:
┌─────────────────────────────────┐
│      [Large Muted Icon]         │
│                                 │
│   "No [items] yet"              │
│   "Brief helpful description"  │
│                                 │
│   [Optional CTA Button]         │
└─────────────────────────────────┘

Pattern:
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
  <h3 className="text-lg font-semibold mb-2">No items found</h3>
  <p className="text-sm text-muted-foreground mb-6">
    Description of what to do
  </p>
  <Button>Call to Action</Button>
</div>
```

### 7. Error Handling
**Current**: Toast notifications exist but underused

**Recommendations**:
```
Add error boundaries:
- Wrap each major section in error boundary
- Show user-friendly error with retry button
- Log errors for debugging

Error UI:
┌─────────────────────────────────┐
│      [🔴 Error Icon]            │
│   "Oops! Something went wrong"  │
│   "Brief explanation"            │
│   [Try Again] [Go Home]         │
└─────────────────────────────────┘
```

### 8. Mobile Optimization
**Current**: Good responsive grids, needs refinement

**Recommendations**:
```
Mobile-specific enhancements:
- Larger touch targets (min-h-12)
- Bottom-sheet style modals
- Swipe gestures (favorites, reading history)
- Fixed bottom navigation for key actions
- Reduced sidebar widths
- Collapsible filters

Breakpoints usage:
- sm: 640px (phone landscape)
- md: 768px (tablet portrait)
- lg: 1024px (tablet landscape/small desktop)
- xl: 1280px (desktop)
- 2xl: 1536px (large desktop)
```

### 9. Accessibility Enhancements
**Current**: Basic ARIA labels present

**Recommendations**:
```
Audit and add:
- aria-label on all icon-only buttons
- role attributes where needed
- Focus management in modals
- Keyboard shortcuts (document them)
- Screen reader announcements for dynamic content
- Color contrast checks (WCAG AA minimum)
- Skip links for main content

Focus visible styles:
- Add focus-visible:ring-2 ring-primary to all focusable elements
```

### 10. Performance Optimizations
**Recommendations**:
```
Implement:
1. Lazy loading:
   - Use React.lazy() for route components
   - Lazy load images with loading="lazy"
   - Infinite scroll for long lists

2. Memoization:
   - React.memo() for BookCard
   - useMemo() for filtered/sorted lists
   - useCallback() for event handlers

3. Virtual scrolling:
   - For admin tables with many rows
   - For long reading history lists
   - Consider react-virtual or react-window

4. Code splitting:
   - Split by route
   - Split heavy libraries (PDF.js when implemented)
```

---

## 📊 PAGE PRIORITY MATRIX

| Page | Current Status | UI Quality | Data Integration | Priority | Effort |
|------|---------------|------------|------------------|----------|--------|
| **Book Detail** | ❌ Missing | N/A | N/A | 🔴 CRITICAL | 2-3 days |
| **Dashboard** | ⚠️ Partial | ✅ 85% | ❌ Mock | 🔴 HIGH | 1 day |
| **Favorites** | ⚠️ Partial | ⚠️ 70% | ❌ Mock | 🔴 HIGH | 1 day |
| **Book Reader** | ⚠️ Skeleton | ⚠️ 30% | ❌ None | 🔴 CRITICAL | 5-7 days |
| **Reading History** | ⚠️ Partial | ⚠️ 70% | ❌ Mock | 🟡 MEDIUM | 1 day |
| **Admin Dashboard** | ⚠️ Partial | ⚠️ 70% | ❌ Mock | 🟡 MEDIUM | 2-3 days |
| **Book Quiz** | ❌ Missing | N/A | ❌ None | 🟡 MEDIUM | 3-4 days |
| **Chatbot** | ✅ Good | ✅ 90% | ❌ Mock AI | 🟢 LOW | 1-2 days |
| **Create** | ✅ Good | ✅ 85% | ⚠️ Simulated | 🟢 LOW | 1-2 days |

---

## 🎯 IMPLEMENTATION ROADMAP

### Phase 1: Critical Missing Pages (Week 1)
1. **Create Book Detail Page** (Priority #1)
   - Use existing Card, Badge, Button, Tabs components
   - Implement review section with ReviewCard pattern
   - Connect to backend APIs
   - Add to routes in App.tsx

### Phase 2: Data Integration (Week 1-2)
2. **Connect Dashboard** - Replace mock data with API calls
3. **Connect Favorites** - Integrate with favorites API
4. **Connect Reading History** - Integrate with history API

### Phase 3: Modernization (Week 2-3)
5. **Refactor Favorites** - Use BookCard component, DropdownMenu
6. **Enhance Reading History** - Add StatCard overview, better layout
7. **Modernize Admin Dashboard** - Real data, better tables

### Phase 4: Core Features (Week 3-5)
8. **Implement Book Reader** - PDF.js integration, annotation system
9. **Implement Book Quiz** - Question/answer system, results display

### Phase 5: Polish (Week 5-6)
10. **Add Loading States** - Skeleton loaders everywhere
11. **Add Empty States** - Consistent pattern
12. **Error Boundaries** - Better error handling
13. **Accessibility Audit** - ARIA labels, keyboard navigation

---

## 📝 SUMMARY

### What Works Well
- ✅ Modern glassmorphic design system
- ✅ Comprehensive component library
- ✅ Good responsive patterns
- ✅ Consistent use of Radix UI primitives

### What Needs Work
- 🔧 Book Detail page (critical missing link)
- 🔧 Backend data integration (all mock data)
- 🔧 Component consistency (replace custom with reusable)
- 🔧 Loading/empty/error states
- 🔧 Book Reader implementation
- 🔧 Quiz system implementation

### Key Principles
1. **Reuse before Create**: Always use existing components first
2. **Consistency**: Match existing design patterns
3. **Accessibility**: All interactions keyboard-accessible
4. **Performance**: Lazy load, memoize, virtualize
5. **Mobile-First**: Responsive from the start

---

**Estimated Time to Complete Wireframe Implementation**: 5-6 weeks with 1-2 developers

**Next Immediate Action**: Create Book Detail page (blocks core user journey)
