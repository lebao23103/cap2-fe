# Motion Policy & Animation Guidelines

**Project:** Knowly - Book Reading Platform  
**Last Updated:** 2025-01-07  
**Status:** Active

## Overview

This document defines the animation and motion design principles for the Knowly platform. All animations must follow these guidelines to ensure consistency, performance, and accessibility.

## Animation Principles

### 1. Purposeful Motion
**Every animation must have a clear purpose:**
- ✅ Provide feedback for user actions
- ✅ Guide attention to important changes
- ✅ Create smooth transitions between states
- ✅ Establish spatial relationships
- ❌ Don't animate for decoration only

### 2. Natural & Subtle
**Motion should feel organic:**
- Use ease-in-out for most transitions
- Prefer subtle movements over dramatic effects
- Maintain consistent physics (gravity, friction)
- Avoid jarring or sudden movements

### 3. Fast & Responsive
**Users expect immediate feedback:**
- Micro-interactions: ≤100ms
- Standard transitions: 200-300ms
- Complex animations: ≤500ms
- Page transitions: ≤400ms

### 4. Accessible by Default
**All motion must respect user preferences:**
- Implement `@media (prefers-reduced-motion: reduce)` fallbacks
- Provide alternative feedback when motion is disabled
- Never rely solely on animation to convey information

## Duration Guidelines

### Micro-interactions (≤100ms)
**Use for immediate feedback:**
- Button hover states
- Focus indicators
- Toggle switches
- Checkbox/radio selections
- Tooltip appearances

```css
.micro-animation {
  transition: all 100ms ease-out;
}
```

### Standard Transitions (200-300ms)
**Use for UI state changes:**
- Card hover effects
- Dropdown menus
- Modal overlays
- Tab switching
- Accordion expansion
- Form validation feedback

```css
.standard-transition {
  transition: all 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Complex Animations (300-500ms)
**Use for page-level changes:**
- Page turn animations (BookReader: 300ms)
- View mode transitions
- Theme changes
- Loading state transitions
- Success/error celebrations

```css
.complex-animation {
  transition: all 500ms cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Long Animations (>500ms)
**Use sparingly, only for special moments:**
- Confetti celebrations
- Achievement unlocks
- Loading spinners (continuous)
- Skeleton screens (shimmer effect)

## Easing Functions

### Standard Easing
**Default for most animations:**
```css
cubic-bezier(0.25, 0.1, 0.25, 1)
```
- Natural acceleration/deceleration
- Smooth start and end
- Use for: transitions, fades, slides

### Ease-Out
**For exits and micro-interactions:**
```css
ease-out
```
- Quick start, slow end
- Feels responsive
- Use for: hover effects, button clicks

### Ease-In
**For entrances:**
```css
ease-in
```
- Slow start, quick end
- Builds momentum
- Use for: modal appearances, dropdowns

### Spring/Bounce
**For playful interactions:**
```css
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```
- Slight overshoot
- Energetic feel
- Use sparingly for: success states, celebrations

## Animation Categories

### 1. Feedback Animations
**Purpose:** Confirm user actions

**Examples:**
- Button press (scale down: 0.98)
- Bookmark toggle (fill animation)
- Favorite heart (pulse + fill)
- Form submission (success checkmark)

**Implementation:**
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
>
  Save
</motion.button>
```

### 2. Transition Animations
**Purpose:** Smoothly change between states

**Examples:**
- Page turns (slide + fade)
- Theme changes (color transitions)
- View mode switches (fade + layout shift)
- Tab switching (slide indicator)

**Implementation:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentPage}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.3 }}
  >
    {content}
  </motion.div>
</AnimatePresence>
```

### 3. Loading Animations
**Purpose:** Indicate progress and maintain engagement

**Examples:**
- Skeleton screens (shimmer)
- Spinner (rotation)
- Progress bars (fill)
- Pulsing placeholders

**Implementation:**
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton {
  animation: shimmer 1.5s infinite;
}
```

### 4. Attention Animations
**Purpose:** Draw focus to important elements

**Examples:**
- Error shake (validation)
- Success pulse (confirmation)
- New badge bounce
- Notification slide-in

**Implementation:**
```tsx
<motion.div
  animate={{ scale: [1, 1.05, 1] }}
  transition={{ duration: 0.3 }}
>
  New notification
</motion.div>
```

### 5. Entrance/Exit Animations
**Purpose:** Smoothly introduce or remove elements

**Examples:**
- Modal fade + scale
- Toast slide-in
- Dropdown slide-down
- Tooltip fade-in

**Implementation:**
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  Modal content
</motion.div>
```

## Platform-Specific Animations

### BookReader
**Page Turn Animation:**
- Duration: 300ms
- Easing: cubic-bezier(0.25, 0.1, 0.25, 1)
- Effect: Slide (100px) + scale (0.98) + fade
- Direction-aware: Forward (right→left), Back (left→right)

**Theme Transitions:**
- Duration: 500ms
- Easing: ease-in-out
- Properties: background-color, color
- Smooth cross-fade between themes

### Book Grid (ReadNEx, Search)
**Stagger Animation:**
- Base delay: 0ms
- Increment: 50ms per card
- Max delay: 400ms (8 cards)
- Effect: Fade + slide up (20px)

**Hover Effects:**
- Duration: 200ms
- Lift: -8px (translateY)
- Shadow: Increase elevation
- Scale: None (conflicts with lift)

### Loading States
**Skeleton Shimmer:**
- Duration: 1.5s
- Iteration: Infinite
- Effect: Gradient sweep
- Direction: Left to right

**Spinner:**
- Duration: 1s
- Iteration: Infinite
- Easing: Linear
- Effect: 360° rotation

## Reduced Motion Support

### Implementation
**All animations must include fallbacks:**

```css
/* Default: Full animation */
.animated-element {
  transition: transform 300ms ease-out;
}

/* Reduced motion: Instant or fade only */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: opacity 200ms ease-out;
    transform: none !important;
  }
}
```

### Framer Motion Pattern
```tsx
const shouldReduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches

<motion.div
  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
  transition={{ duration: shouldReduceMotion ? 0.15 : 0.3 }}
>
  Content
</motion.div>
```

### Reduced Motion Rules
1. **Remove motion**, keep fade: Preserve opacity transitions
2. **Instant transitions**: Reduce duration to ≤150ms
3. **No transform**: Remove translate, scale, rotate
4. **Keep essential feedback**: Maintain focus indicators, state changes

## Performance Guidelines

### 60 FPS Target
**Use GPU-accelerated properties:**
- ✅ `transform` (translate, scale, rotate)
- ✅ `opacity`
- ❌ `width`, `height`, `top`, `left` (causes reflow)
- ❌ `margin`, `padding` (causes reflow)

### Optimization Tips
```css
/* Force GPU acceleration */
.optimized-animation {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

### Animation Best Practices
1. **Limit concurrent animations:** Max 5-10 elements simultaneously
2. **Use `will-change` sparingly:** Only for actively animating elements
3. **Clean up:** Remove `will-change` after animation completes
4. **Debounce scroll animations:** Use IntersectionObserver
5. **Test on low-end devices:** Ensure smooth performance

## Accessibility Checklist

- [ ] All animations have reduced-motion fallbacks
- [ ] Motion doesn't convey essential information alone
- [ ] Animations don't trigger vestibular disorders (no parallax, no continuous spinning)
- [ ] Focus indicators remain visible during animations
- [ ] Screen readers announce state changes (not just visual changes)
- [ ] Keyboard navigation works during transitions
- [ ] Animations don't block interaction (except intentional loading states)

## Common Patterns

### Button Press
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.1 }}
>
  Click me
</motion.button>
```

### Card Hover
```tsx
<motion.div
  whileHover={{ y: -8 }}
  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
  className="card"
>
  Card content
</motion.div>
```

### Page Transition
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={page}
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -100 }}
    transition={{ duration: 0.3 }}
  >
    Page content
  </motion.div>
</AnimatePresence>
```

### Loading Skeleton
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite;
}
```

### Success Celebration
```tsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: [0, 1.2, 1] }}
  transition={{ duration: 0.5, times: [0, 0.6, 1] }}
>
  ✓ Success!
</motion.div>
```

## Design Tokens

All animation values are defined in `src/styles/tokens/motion.css`:

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  
  /* Easing */
  --ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-in: ease-in;
  --ease-out: ease-out;
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Testing

### Manual Testing
1. Test all animations with "Reduce motion" enabled
2. Verify smooth 60fps on target devices
3. Check animations on slow connections
4. Test keyboard navigation during transitions
5. Verify screen reader announcements

### Automated Testing
```typescript
// Test reduced motion
it('respects prefers-reduced-motion', () => {
  const { rerender } = render(<AnimatedComponent />)
  
  // Mock reduced motion preference
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-reduced-motion: reduce)',
    media: query,
  }))
  
  rerender(<AnimatedComponent />)
  // Assert no motion transforms applied
})
```

## Resources

### Documentation
- [Framer Motion Docs](https://www.framer.com/motion/)
- [MDN: CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [WCAG: Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)

### Tools
- Chrome DevTools Performance tab
- React DevTools Profiler
- Lighthouse performance audit

---

**Last Reviewed:** 2025-01-07  
**Next Review:** After major animation changes

**Questions?** Contact the frontend team or refer to existing implementations in:
- `src/pages/BookReader.tsx` (page turn animations)
- `src/pages/ReadNEx.tsx` (stagger animations)
- `src/components/books/` (loading states)
