# Light Mode Visibility Fix Guide

## Problem
Text and icons were invisible in light mode due to CSS variables (`text-foreground`, `text-muted-foreground`) not having explicit light/dark mode variants.

## Solution Pattern

### 1. Text Colors
```tsx
// ❌ WRONG - invisible in light mode
className="text-foreground"
className="text-muted-foreground"

// ✅ RIGHT - visible in both modes
className="text-gray-900 dark:text-foreground"          // Headings
className="text-gray-600 dark:text-muted-foreground"   // Body text
className="text-gray-500 dark:text-muted-foreground"   // Small/secondary text
className="text-gray-400 dark:text-muted-foreground"   // Placeholder/icons
```

### 2. Icon Colors
```tsx
// ❌ WRONG - invisible icons
<Heart className="h-4 w-4" />

// ✅ RIGHT - visible icons
<Heart className="h-4 w-4 text-gray-600 dark:text-foreground" />
<Search className="h-4 w-4 text-gray-400 dark:text-muted-foreground" />
```

### 3. Button Text
Already fixed in base components:
- `src/components/ui/button-variants.ts` - ghost and outline variants
- `src/components/ui/modern/ModernButton.tsx` - all variants

### 4. Use Cases

| Element Type | Light Mode | Dark Mode | Class |
|-------------|-----------|-----------|-------|
| Page Titles | `text-gray-900` | `text-foreground` | `text-gray-900 dark:text-foreground` |
| Section Headers | `text-gray-900` | `text-foreground` | `text-gray-900 dark:text-foreground` |
| Body Text | `text-gray-600` | `text-muted-foreground` | `text-gray-600 dark:text-muted-foreground` |
| Labels | `text-gray-700` | `text-foreground` | `text-gray-700 dark:text-foreground` |
| Helper Text | `text-gray-500` | `text-muted-foreground` | `text-gray-500 dark:text-muted-foreground` |
| Disabled Text | `text-gray-400` | `text-muted-foreground` | `text-gray-400 dark:text-muted-foreground` |
| Icons (default) | `text-gray-600` | `text-foreground` | `text-gray-600 dark:text-foreground` |
| Icons (muted) | `text-gray-400` | `text-muted-foreground` | `text-gray-400 dark:text-muted-foreground` |

## Files Fixed

### ✅ Core Components
- [x] `src/components/ui/button-variants.ts`
- [x] `src/components/ui/modern/ModernButton.tsx`
- [x] `src/components/Layout.tsx`
- [x] `src/components/ui/theme-toggle.tsx`

### ✅ Pages - Completed
- [x] `src/pages/Home.tsx`
- [x] `src/pages/ReadNEx.tsx`
- [x] `src/pages/BookDetail.tsx`
- [x] `src/pages/Dashboard.tsx`
- [x] `src/pages/Favorites.tsx`
- [x] `src/pages/ReadingHistory.tsx`
- [x] `src/pages/Login.tsx`
- [x] `src/pages/Register.tsx`
- [x] `src/pages/Chatbot.tsx` (partial)

### ⏳ Pages - Remaining (Low Priority)
- [ ] `src/pages/ResetPassword.tsx` - password reset form
- [ ] `src/pages/Create.tsx` - book upload form
- [ ] `src/pages/AdminDashboard.tsx` - admin interface
- [ ] `src/pages/BookReader.tsx` - reading interface
- [ ] `src/pages/NoteShare.tsx` - notes interface
- [ ] `src/pages/BookQuiz.tsx` - quiz interface
- [ ] `src/pages/About.tsx` - static page
- [ ] `src/pages/Contact.tsx` - contact form
- [ ] `src/pages/FAQ.tsx` - static page

**Note**: All core functionality pages are now fixed. The remaining pages can be fixed using the same pattern or with the automated script provided.

## Quick Fix Command

Find all instances:
```bash
# Find text-foreground without dark: prefix
grep -r "text-foreground" --include="*.tsx" src/pages/

# Find text-muted-foreground without dark: prefix
grep -r "text-muted-foreground" --include="*.tsx" src/pages/
```

## Testing
1. Switch to light mode
2. Check all pages for:
   - Visible headings
   - Visible body text
   - Visible button text
   - Visible icons
   - Proper hover states

## Notes
- Always test in both light and dark modes
- Icons need explicit colors when they don't have text siblings
- Buttons with only icons need icon color classes
- Use `!important` (e.g., `!text-gray-900`) only when necessary to override conflicting styles
