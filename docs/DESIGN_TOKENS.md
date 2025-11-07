# Design Tokens Documentation

**Created**: 2025-11-07  
**Status**: ✅ Complete  
**Location**: `src/styles/tokens/`  
**Related**: `MOTION_POLICY.md` (to be created in Phase 14)

---

## Overview

Design tokens are the foundational design decisions of the Knowly platform, expressed as CSS custom properties (variables). They provide a single source of truth for spacing, colors, typography, shadows, and animations.

### Purpose
- **Consistency**: Same values used across entire application
- **Maintainability**: Update once, change everywhere
- **Themeable**: Easy dark/light mode support
- **Scalable**: Add new tokens without breaking existing ones
- **Developer-friendly**: Autocomplete in modern editors

### Architecture
```
src/styles/tokens/
├── tokens.css      # Spacing, colors, typography, shadows
└── motion.css      # Animations, transitions, durations
```

Both files are imported in `src/index.css` before Tailwind utilities.

---

## 📏 Spacing Scale

Based on **8px rhythm** for vertical consistency.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--spacing-0` | `0` | 0px | Reset spacing |
| `--spacing-1` | `0.25rem` | 4px | Micro spacing, icon gaps |
| `--spacing-2` | `0.5rem` | 8px | **Base unit**, tight spacing |
| `--spacing-3` | `0.75rem` | 12px | Button padding |
| `--spacing-4` | `1rem` | 16px | **Standard spacing**, element gaps |
| `--spacing-5` | `1.25rem` | 20px | Card internal padding |
| `--spacing-6` | `1.5rem` | 24px | Medium spacing between sections |
| `--spacing-8` | `2rem` | 32px | Large gaps |
| `--spacing-10` | `2.5rem` | 40px | Section padding |
| `--spacing-12` | `3rem` | 48px | Extra large gaps |
| `--spacing-16` | `4rem` | 64px | Section spacing |
| `--spacing-20` | `5rem` | 80px | Major sections |
| `--spacing-24` | `6rem` | 96px | Hero sections |

### Usage Examples
```css
/* Component padding */
.card {
  padding: var(--spacing-6);
}

/* Stack spacing */
.stack {
  gap: var(--spacing-4);
}

/* Section spacing */
.section {
  padding-block: var(--spacing-16);
}
```

---

## 🎨 Typography Scale

Modular scale with **1.25 ratio** for harmonious sizing.

### Font Sizes

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--font-size-xs` | `0.75rem` | 12px | Captions, metadata |
| `--font-size-sm` | `0.875rem` | 14px | Small text, labels |
| `--font-size-base` | `1rem` | 16px | **Body text** |
| `--font-size-lg` | `1.125rem` | 18px | Lead paragraphs |
| `--font-size-xl` | `1.25rem` | 20px | Subheadings |
| `--font-size-2xl` | `1.5rem` | 24px | H3 |
| `--font-size-3xl` | `1.875rem` | 30px | H2 |
| `--font-size-4xl` | `2.25rem` | 36px | H1 |
| `--font-size-5xl` | `3rem` | 48px | Hero titles |
| `--font-size-6xl` | `3.75rem` | 60px | Extra large display |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasis |
| `--font-weight-semibold` | `600` | Subheadings |
| `--font-weight-bold` | `700` | Headings |
| `--font-weight-extrabold` | `800` | Display text |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--line-height-tight` | `1.25` | Headings, compact text |
| `--line-height-snug` | `1.375` | Tight paragraphs |
| `--line-height-normal` | `1.5` | **Body text** |
| `--line-height-relaxed` | `1.625` | Comfortable reading |
| `--line-height-loose` | `2` | Spacious text |

### Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--letter-spacing-tighter` | `-0.05em` | Large headings |
| `--letter-spacing-tight` | `-0.025em` | Headings |
| `--letter-spacing-normal` | `0` | Body text |
| `--letter-spacing-wide` | `0.025em` | Uppercase text |
| `--letter-spacing-wider` | `0.05em` | Buttons, labels |
| `--letter-spacing-widest` | `0.1em` | Small caps |

### Usage Example
```css
.heading {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}
```

---

## 🔲 Border Radius

Consistent rounded corners across the application.

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `--radius-none` | `0` | 0px | Sharp corners |
| `--radius-sm` | `0.125rem` | 2px | Subtle rounding |
| `--radius-base` | `0.25rem` | 4px | Inputs, small elements |
| `--radius-md` | `0.375rem` | 6px | Badges |
| `--radius-lg` | `0.5rem` | 8px | **Cards, buttons** |
| `--radius-xl` | `0.75rem` | 12px | Large cards |
| `--radius-2xl` | `1rem` | 16px | Hero cards |
| `--radius-3xl` | `1.5rem` | 24px | Special elements |
| `--radius-full` | `9999px` | Full | Pills, circles, avatars |

---

## 🌑 Elevation (Shadows)

Layered shadow system for depth perception.

| Token | Usage | Example |
|-------|-------|---------|
| `--shadow-xs` | Subtle lift | Hover states |
| `--shadow-sm` | **Base elevation** | Cards at rest |
| `--shadow-base` | Moderate lift | Elevated cards |
| `--shadow-md` | Prominent elevation | Dropdowns |
| `--shadow-lg` | High elevation | Modal backdrop |
| `--shadow-xl` | Maximum elevation | Tooltips |
| `--shadow-2xl` | Dramatic depth | Hero elements |
| `--shadow-inner` | Inset depth | Pressed buttons |

### Glass-morphism Shadows
| Token | Usage |
|-------|-------|
| `--shadow-glass` | Standard glass effect |
| `--shadow-glass-lg` | Large glass panels |

### Utility Classes
```css
.elevation-1 { box-shadow: var(--shadow-sm); }
.elevation-2 { box-shadow: var(--shadow-base); }
.elevation-3 { box-shadow: var(--shadow-md); }
.elevation-4 { box-shadow: var(--shadow-lg); }
.elevation-5 { box-shadow: var(--shadow-xl); }
```

---

## 🎭 Z-Index Scale

Consistent layering for overlapping elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--z-index-base` | `0` | Default layer |
| `--z-index-dropdown` | `10` | Dropdown menus |
| `--z-index-sticky` | `20` | Sticky headers |
| `--z-index-fixed` | `30` | Fixed navigation |
| `--z-index-modal-backdrop` | `40` | Modal background |
| `--z-index-modal` | `50` | Modal content |
| `--z-index-popover` | `60` | Popovers |
| `--z-index-tooltip` | `70` | Tooltips |
| `--z-index-toast` | `80` | Toast notifications |

---

## 🎨 Semantic Colors

Theme-aware colors that adapt to light/dark mode.

### Brand Colors
- `--color-primary` / `--color-primary-foreground`
- `--color-secondary` / `--color-secondary-foreground`

### Surface Colors
- `--color-background` / `--color-foreground`
- `--color-card` / `--color-card-foreground`
- `--color-muted` / `--color-muted-foreground`

### Interaction Colors
- `--color-accent` / `--color-accent-foreground`
- `--color-destructive` / `--color-destructive-foreground`

### UI Colors
- `--color-border` - Border color
- `--color-input` - Input borders
- `--color-ring` - Focus rings

### Status Colors (Fixed)
These don't change with theme:

| Color | Light | Dark | Usage |
|-------|-------|------|-------|
| Success | `hsl(142, 76%, 36%)` | `hsl(142, 76%, 25%)` | Confirmations |
| Error | `hsl(0, 84%, 60%)` | `hsl(0, 84%, 40%)` | Errors, validation |
| Warning | `hsl(38, 92%, 50%)` | `hsl(38, 92%, 35%)` | Warnings, caution |
| Info | `hsl(199, 89%, 48%)` | `hsl(199, 89%, 35%)` | Information |

Each has `-light` and `-dark` variants for backgrounds.

---

## ⏱️ Motion Tokens

Located in `motion.css`, these control all animations.

### Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | `0ms` | No animation |
| `--duration-fast` | `100ms` | **Micro-interactions** (hover) |
| `--duration-normal` | `200ms` | **Standard transitions** |
| `--duration-slow` | `300ms` | Complex state changes |
| `--duration-slower` | `400ms` | Entrances/exits |
| `--duration-slowest` | `500ms` | Elaborate animations |

### Easing Functions

| Token | Curve | Usage |
|-------|-------|-------|
| `--easing-linear` | `linear` | Continuous motion |
| `--easing-ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Accelerating |
| `--easing-ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | **Decelerating** (most common) |
| `--easing-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth start/end |
| `--easing-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Overshoot effect |
| `--easing-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Spring-like |
| `--easing-smooth` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Polished feel |
| `--easing-snappy` | `cubic-bezier(0.4, 0.0, 0.6, 1)` | Quick response |

### Transition Presets

```css
--transition-base: all var(--duration-normal) var(--easing-ease-out);
--transition-fast: all var(--duration-fast) var(--easing-ease-out);
--transition-slow: all var(--duration-slow) var(--easing-ease-out);
--transition-colors: /* color, background, border */
--transition-opacity: /* opacity only */
--transition-transform: /* transform only */
--transition-shadow: /* box-shadow only */
--transition-interactive: /* transform + shadow for buttons */
--transition-modal: /* opacity + transform for modals */
```

---

## 🧩 Utility Classes

Pre-built classes using design tokens.

### Elevation
```html
<div class="elevation-1">Base elevation</div>
<div class="elevation-3">Medium elevation</div>
<div class="elevation-5">Maximum elevation</div>
```

### Glass-morphism
```html
<div class="glass">Glass effect (light mode)</div>
<div class="glass-dark">Glass effect (dark mode)</div>
```

### Reading Width
```html
<div class="reading-width">
  Optimal line length for reading (65 characters)
</div>
```

### Containers
```html
<div class="container-sm">Small container (768px max)</div>
<div class="container-md">Medium container (1024px max)</div>
<div class="container-lg">Large container (1280px max)</div>
```

### Animations
```html
<!-- Fade -->
<div class="animate-fade-in">Fades in</div>
<div class="animate-fade-out">Fades out</div>

<!-- Slide -->
<div class="animate-slide-in-up">Slides up</div>
<div class="animate-slide-in-down">Slides down</div>
<div class="animate-slide-in-left">Slides from left</div>
<div class="animate-slide-in-right">Slides from right</div>

<!-- Scale -->
<div class="animate-scale-in">Scales in</div>
<div class="animate-bounce-in">Bounces in</div>

<!-- Feedback -->
<div class="animate-shake">Shakes (error)</div>
<div class="animate-pulse">Pulses (notification)</div>

<!-- Loading -->
<div class="animate-spin">Spins (loader)</div>
<div class="animate-shimmer">Shimmer effect</div>
<div class="skeleton">Skeleton loader</div>
```

### Interaction
```html
<button class="interactive press-effect focus-ring">
  Interactive button with all effects
</button>
```

---

## 🚀 Usage Guidelines

### DO ✅
- **Use tokens everywhere**: `padding: var(--spacing-4);`
- **Combine tokens**: Create complex values from simple ones
- **Use semantic colors**: `color: var(--color-primary);`
- **Use preset transitions**: `transition: var(--transition-base);`
- **Use utility classes**: `<div class="elevation-2 animate-fade-in">`

### DON'T ❌
- **Hard-code values**: ~~`padding: 16px;`~~ (use `var(--spacing-4)`)
- **Override token values in components**: Change in tokens.css
- **Mix px and rem randomly**: Use tokens for consistency
- **Skip semantic colors**: ~~`color: #6366f1;`~~ (use `var(--color-primary)`)
- **Create one-off animations**: Use existing animations or add to motion.css

---

## 🔧 Adding New Tokens

### Process
1. **Determine need**: Is this truly reusable?
2. **Check existing**: Can you use existing tokens?
3. **Add to appropriate file**: `tokens.css` or `motion.css`
4. **Document here**: Update this file
5. **Commit with context**: Explain why it was added

### Example: Adding New Spacing
```css
/* In tokens.css */
--spacing-7: 1.75rem;  /* 28px - specific use case */
```

Then document:
```markdown
| `--spacing-7` | `1.75rem` | 28px | Specific component need |
```

---

## 🎯 Migration Guide

### From Tailwind Classes
```html
<!-- Before -->
<div class="p-4 rounded-lg shadow-md">

<!-- After (using tokens in custom CSS) -->
<div class="my-component">
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
</div>
```

### From Hard-coded Values
```css
/* Before */
.button {
  padding: 12px 24px;
  border-radius: 8px;
  transition: all 0.2s ease-out;
}

/* After */
.button {
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}
```

---

## ♿ Accessibility

### Reduced Motion
All animations automatically respect `@media (prefers-reduced-motion: reduce)`:
- Durations become instant (0ms)
- Bounce/spring easings become linear
- All animations/transitions disabled

### Runtime Toggle
Use `data-no-motion` attribute:
```html
<div data-no-motion>
  This element won't animate
</div>
```

---

## 🧪 Testing

### Visual Regression
When changing tokens, test:
1. **All pages** in light and dark mode
2. **All components** in Storybook
3. **Interactive states** (hover, focus, active)
4. **Animations** with motion enabled/disabled

### Browser Support
Tokens work in:
- ✅ Chrome 49+ (2016)
- ✅ Firefox 31+ (2014)
- ✅ Safari 9.1+ (2016)
- ✅ Edge 15+ (2017)

CSS custom properties are well-supported.

---

## 📚 Related Documentation

- **MOTION_POLICY.md** - Animation principles and guidelines (Phase 14)
- **ACCESSIBILITY.md** - WCAG compliance (Phase 15)
- **DESIGN_SYSTEM.md** - Overall design system
- **MODERN_UI_DESIGN_SYSTEM.md** - Component patterns

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-07 | Initial design token system |

---

**Status**: ✅ Production Ready  
**Maintained By**: Frontend Team  
**Last Updated**: 2025-11-07
