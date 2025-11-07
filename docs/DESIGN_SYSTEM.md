# Knowly Design System

> **Version**: 1.0.0  
> **Last Updated**: 2025-10-26  
> **Status**: Active

This document defines the visual and interaction standards for the Knowly platform. All new components and pages should follow these guidelines.

---

## 🎨 Design Principles

1. **Clarity over decoration** - Every element serves a purpose
2. **Consistency over novelty** - Predictable patterns build trust
3. **Accessibility first** - Usable by everyone, everywhere
4. **Mobile-responsive** - Design for smallest screen first
5. **Performance-conscious** - Fast load times, smooth interactions

---

## 📐 Grid System

### Responsive Breakpoints
```
Mobile:  < 768px   (1 column)
Tablet:  768-1024px (2 columns)
Desktop: > 1024px   (3-4 columns)
```

### Standard Grid Patterns

**Stats/Metrics Cards**
```tsx
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
```

**Content Cards (Books, Articles)**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
```

**Form Layouts**
```tsx
className="grid grid-cols-1 md:grid-cols-2 gap-6"
```

**Filters/Controls**
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
```

### Grid Guidelines
- ✅ Use `gap-4` (16px) for compact layouts
- ✅ Use `gap-6` (24px) for comfortable spacing
- ✅ Use `gap-8` (32px) for loose, airy layouts
- ✅ Never exceed 4 columns on XL screens for content cards
- ❌ Don't use `grid-cols-5` or higher for visual content

---

## 🔘 Button System

### Size Scale

| Size | Class | Height | Use Case |
|------|-------|--------|----------|
| **xs** | `size="sm"` | h-8 (32px) | Compact spaces, table actions |
| **sm** | `size="sm"` | h-9 (36px) | Secondary actions, toolbars |
| **md** | `size="default"` | h-10 (40px) | Default buttons, forms |
| **lg** | `size="lg"` | h-11 (44px) | Primary CTAs, important actions |
| **xl** | Custom `h-14` | h-14 (56px) | Hero sections only |

### Hierarchy

**Primary Action** (Only one per section)
```tsx
<Button className="bg-gradient-to-r from-primary to-secondary">
  Primary Action
</Button>
```

**Secondary Action**
```tsx
<Button variant="outline">
  Secondary Action
</Button>
```

**Tertiary Action**
```tsx
<Button variant="ghost">
  Tertiary Action
</Button>
```

### Button Guidelines
- ✅ One primary action per viewport section
- ✅ Use `size="lg"` for submit buttons in forms
- ✅ Icon buttons must have `aria-label`
- ✅ Disabled states should have reduced opacity
- ❌ Don't use custom padding (`py-6`, `px-8`) - use size prop
- ❌ Don't stack multiple gradient buttons

---

## 🎯 Icon System

### Size Scale

| Size | Class | Pixels | Use Case |
|------|-------|--------|----------|
| **xs** | `h-3 w-3` | 12px | Inline with small text, badges |
| **sm** | `h-4 w-4` | 16px | Standard inline icons, buttons |
| **md** | `h-5 w-5` | 20px | Section headers, navigation |
| **lg** | `h-6 w-6` | 24px | Page headers, large buttons |
| **xl** | `h-8 w-8` | 32px | Feature displays, empty states |

### Icon Guidelines
- ✅ Match icon size to adjacent text size
- ✅ Use `h-4 w-4` as default for button icons
- ✅ Add `aria-hidden="true"` to decorative icons
- ✅ Maintain 1:1 aspect ratio (square)
- ❌ Don't use arbitrary sizes like `h-7 w-7`

---

## 🏗️ Card Elevation System

### Elevation Levels

**Level 1 - Subtle (Default)**
```tsx
className="shadow-sm border border-border"
```
- Use for: List items, contained sections
- Effect: Gentle separation from background

**Level 2 - Raised**
```tsx
className="shadow-md border-0"
```
- Use for: Interactive cards, dropdowns
- Effect: Appears above page surface

**Level 3 - Floating**
```tsx
className="shadow-lg border-0"
```
- Use for: Modals, popovers, important cards
- Effect: Clearly elevated from page

### Card Guidelines
- ✅ Use Level 1 for most cards
- ✅ Use Level 2 for hover states and interactive elements
- ✅ Use Level 3 sparingly for dialogs and overlays
- ✅ Cards should have `rounded-lg` or `rounded-xl` corners
- ❌ Don't mix border and high shadow (use one or the other)

---

## 🎨 Color Semantics

### Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| **Info** | Blue | Informational messages, links |
| **Success** | Green | Completed actions, success states |
| **Warning** | Yellow/Amber | Caution, pending actions |
| **Error** | Red | Errors, destructive actions |
| **Feature** | Purple | Special features, premium content |

### Implementation

**Status Badges**
```tsx
<Badge variant="default">Info</Badge>
<Badge className="bg-green-100 text-green-800">Success</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
<Badge className="bg-red-100 text-red-800">Error</Badge>
<Badge className="bg-purple-100 text-purple-800">Feature</Badge>
```

### Color Guidelines
- ✅ Use semantic colors consistently (green always = success)
- ✅ Ensure WCAG AA contrast (4.5:1 for text)
- ✅ Test colors in both light and dark mode
- ❌ Don't use red for non-error states
- ❌ Don't use green for anything other than success/completion

---

## 📏 Spacing Rhythm

### Base Unit: 8px

All spacing should use multiples of 8px (or 4px for micro-adjustments).

### Spacing Scale

| Scale | Tailwind | Pixels | Use Case |
|-------|----------|--------|----------|
| **xs** | `gap-2` `p-2` | 8px | Tight spacing, icon gaps |
| **sm** | `gap-3` `p-3` | 12px | Compact components |
| **md** | `gap-4` `p-4` | 16px | Default component padding |
| **lg** | `gap-6` `p-6` | 24px | Card content padding |
| **xl** | `gap-8` `p-8` | 32px | Section spacing |
| **2xl** | `gap-12` `p-12` | 48px | Major section breaks |

### Section Spacing
```tsx
// Default sections
className="py-16 px-4"

// Hero sections
className="py-24 px-4"

// Compact sections
className="py-8 px-4"
```

### Spacing Guidelines
- ✅ Use consistent vertical rhythm (16px, 24px, 32px)
- ✅ More whitespace = better hierarchy
- ✅ Responsive spacing: `p-4 md:p-6 lg:p-8`
- ❌ Don't use arbitrary values like `p-[17px]`
- ❌ Don't crowd elements - when in doubt, add more space

---

## ✨ Animation System

### Standard Animations

**Fade In Up**
```tsx
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}
```

**Stagger Children**
```tsx
const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 }
  }
}
```

**Hover Scale**
```tsx
whileHover={{ scale: 1.05 }}
transition={{ duration: 0.2 }}
```

### Animation Guidelines
- ✅ Import from `@/lib/animations.ts` (don't redefine)
- ✅ Keep durations short: 200-600ms
- ✅ Use `ease-out` for entering, `ease-in` for exiting
- ✅ Respect `prefers-reduced-motion`
- ❌ Don't animate on every state change
- ❌ Don't use animations longer than 1 second

---

## 📝 Form Patterns

### Input Structure
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
  <div className="min-h-[20px]">
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
</div>
```

### Form Guidelines
- ✅ Always pair `<Label>` with `htmlFor` matching input `id`
- ✅ Reserve space for errors with `min-h-[20px]` wrapper
- ✅ Use `space-y-6` between form fields
- ✅ Use `space-y-2` between label and input
- ✅ Submit buttons should be `size="lg"`
- ❌ Don't show errors without reserving space (prevents layout shift)

---

## 📱 Responsive Patterns

### Mobile-First Approach

**Show/Hide Based on Viewport**
```tsx
// Hide on mobile, show on desktop
className="hidden md:block"

// Show on mobile, hide on desktop
className="block md:hidden"
```

**Responsive Text**
```tsx
className="text-2xl md:text-4xl lg:text-6xl"
```

**Responsive Spacing**
```tsx
className="p-4 md:p-6 lg:p-8"
```

### Touch Targets
- ✅ Minimum 44×44px for interactive elements
- ✅ Add padding around clickable text
- ✅ Buttons should be `h-11` (44px) on mobile
- ❌ Don't rely on hover states (use focus states too)

---

## ♿ Accessibility Standards

### Semantic HTML
```tsx
// ✅ Good
<button onClick={handleClick}>Submit</button>

// ❌ Bad
<div onClick={handleClick}>Submit</div>
```

### ARIA Labels
```tsx
// Icon-only button
<Button variant="ghost" aria-label="Toggle theme">
  <Moon className="h-4 w-4" />
</Button>

// Decorative icon
<Star className="h-4 w-4" aria-hidden="true" />

// Toggle button
<Button aria-pressed={isActive} onClick={toggle}>
  View Grid
</Button>
```

### Keyboard Navigation
- ✅ All interactive elements must be keyboard accessible
- ✅ Escape key closes modals
- ✅ Enter key submits forms
- ✅ Tab order follows visual order
- ✅ Focus states must be visible

### Accessibility Checklist
- [ ] All images have `alt` text (or `alt=""` if decorative)
- [ ] All form inputs have associated labels
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works throughout
- [ ] Screen reader tested on key flows
- [ ] Focus indicators are visible
- [ ] No flashing content (seizure risk)

---

## 🧪 Component Usage Examples

### Card with Proper Elevation
```tsx
<Card className="shadow-md border-0 hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>
```

### Button Group with Hierarchy
```tsx
<div className="flex gap-4">
  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary">
    Primary Action
  </Button>
  <Button size="lg" variant="outline">
    Secondary Action
  </Button>
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

---

## 🚫 Common Anti-Patterns

### ❌ Don't Do This

**Arbitrary Spacing**
```tsx
// Bad: Random pixel values
<div className="p-[13px] mb-[27px]">
```

**Custom Button Sizes**
```tsx
// Bad: Inconsistent sizing
<Button className="py-6 px-10">
```

**Inconsistent Grids**
```tsx
// Bad: Too many columns
<div className="grid-cols-5 xl:grid-cols-6">
```

**Missing Elevation**
```tsx
// Bad: Mixing border and high shadow
<Card className="shadow-xl border-2">
```

### ✅ Do This Instead

**Standard Spacing**
```tsx
// Good: Use spacing scale
<div className="p-4 mb-8">
```

**Standard Button Sizes**
```tsx
// Good: Use size prop
<Button size="lg">
```

**Reasonable Grids**
```tsx
// Good: Max 4 columns
<div className="grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
```

**Proper Elevation**
```tsx
// Good: Shadow without border
<Card className="shadow-md border-0">
```

---

## 📚 Resources

### Internal
- **Component Library**: `src/components/ui/`
- **Animations**: `src/lib/animations.ts` (import shared variants)
- **Utilities**: `src/lib/utils.ts` (cn helper for classnames)

### External
- [Radix UI Documentation](https://www.radix-ui.com/) - Component primitives
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility classes
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility

---

## 🔄 Changelog

### v1.0.0 - 2025-10-26
- Initial design system documentation
- Established grid, button, icon, and spacing standards
- Defined elevation and color systems
- Added accessibility guidelines

---

## 💬 Questions or Suggestions?

This is a living document. If you:
- Find inconsistencies in the codebase
- Have suggestions for improvements
- Need clarification on any guideline
- Want to propose new patterns

Please create an issue or discuss with the team.

**Maintainer**: Design System Team  
**Last Review**: 2025-10-26
