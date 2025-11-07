# Modern UI Quick Reference Guide

## 🚀 Component Import

```tsx
import { ModernButton, StatCard, SectionHeader } from '@/components/ui/modern'
```

---

## 🔘 ModernButton

### Basic Usage
```tsx
<ModernButton variant="primary" size="md">
  Click Me
</ModernButton>
```

### With Icon
```tsx
<ModernButton variant="success" size="sm" icon={Plus} iconPosition="left">
  Add Item
</ModernButton>
```

### Loading State
```tsx
<ModernButton isLoading>Processing...</ModernButton>
```

### Variants
- `primary` - Brand color, main actions
- `secondary` - Subtle background
- `ghost` - Transparent
- `danger` - Red, destructive
- `success` - Green, confirmations

---

## 📊 StatCard

### Basic Metric
```tsx
<StatCard 
  icon={Clock}
  label="Reading Time"
  value="4h 30m"
  variant="primary"
/>
```

### With Progress Bar
```tsx
<StatCard 
  icon={Eye}
  label="Progress"
  value="70%"
  variant="success"
>
  <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: '70%' }} />
  </div>
</StatCard>
```

### Variants
- `primary` - Blue theme
- `success` - Green theme
- `warning` - Amber theme
- `info` - Light blue theme

---

## 📋 SectionHeader

### Simple Header
```tsx
<SectionHeader 
  title="My Notes"
  variant="warning"
/>
```

### With Icon and Badge
```tsx
<SectionHeader 
  title="Bookmarks"
  icon={Bookmark}
  badge={5}
  variant="info"
/>
```

### With Action Button
```tsx
<SectionHeader 
  title="My Notes"
  icon={StickyNote}
  badge={noteCount}
  variant="warning"
  action={
    <ModernButton size="sm" icon={Plus}>
      New
    </ModernButton>
  }
/>
```

---

## 🎨 Design Tokens

### Colors
```tsx
// Primary gradient
"bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5"

// Success gradient
"bg-gradient-to-br from-green-500/5 via-green-500/3 to-transparent"

// Warning gradient  
"bg-gradient-to-br from-amber-500/5 via-amber-500/3 to-transparent"
```

### Shadows
```tsx
"shadow-sm"       // Subtle
"shadow-md"       // Medium (hover)
"shadow-lg"       // Strong
"shadow-xl"       // Maximum
```

### Border Radius
```tsx
"rounded"         // 4px
"rounded-lg"      // 8px
"rounded-xl"      // 12px (modern)
"rounded-2xl"     // 16px
```

### Transitions
```tsx
"transition-all duration-300"  // Standard
"transition-opacity duration-200" // Fade
"transition-transform duration-300" // Movement
```

---

## ✨ Animation Patterns

### Icon Scale on Hover
```tsx
<Icon className="transition-transform duration-300 group-hover:scale-110" />
```

### Button Gradient Shift
```tsx
className="bg-gradient-to-r from-background to-background/95
           hover:from-primary/5 hover:to-transparent
           transition-all duration-300"
```

### Shadow Elevation
```tsx
className="shadow-sm hover:shadow-md transition-shadow duration-300"
```

### Directional Movement
```tsx
// Slide left
className="group-hover:-translate-x-1 transition-transform duration-300"

// Slide right
className="group-hover:translate-x-1 transition-transform duration-300"
```

### Rotation
```tsx
className="transition-transform duration-300 group-hover:rotate-90"
```

### Fade In/Out
```tsx
className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
```

---

## 📦 Card Pattern

```tsx
<Card className="border-0 shadow-xl bg-gradient-to-br 
                from-card via-card to-card/95 
                backdrop-blur-sm hover:shadow-2xl 
                transition-shadow duration-300">
  <CardHeader className="pb-4 border-b border-border/30">
    <SectionHeader title="Section Title" variant="primary" />
  </CardHeader>
  <CardContent className="pt-6 space-y-5">
    {/* Your content */}
  </CardContent>
</Card>
```

---

## 🎯 Interactive Element Pattern

```tsx
<div className="group relative overflow-hidden rounded-xl 
               border border-primary/10 bg-gradient-to-br 
               from-primary/5 via-primary/3 to-transparent 
               p-4 hover:border-primary/20 hover:shadow-md 
               transition-all duration-300 cursor-pointer">
  <div className="flex items-center gap-4">
    <div className="p-3 rounded-xl bg-gradient-to-br 
                   from-primary/20 to-primary/10 
                   group-hover:scale-105 transition-all">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wider 
                   text-muted-foreground font-semibold">
        Label
      </p>
      <p className="text-lg font-bold text-foreground">
        Value
      </p>
    </div>
  </div>
</div>
```

---

## 💡 Empty State Pattern

```tsx
<div className="text-center py-12">
  <div className="relative inline-block">
    <div className="absolute inset-0 bg-amber-500/10 blur-2xl rounded-full" />
    <div className="relative p-4 rounded-2xl bg-gradient-to-br 
                   from-amber-500/10 to-amber-500/5 
                   border border-amber-500/20">
      <Icon className="h-10 w-10 mx-auto text-amber-500" />
    </div>
  </div>
  <p className="text-sm font-semibold text-foreground mt-4">
    No items yet
  </p>
  <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">
    Get started by adding your first item
  </p>
</div>
```

---

## 🖍️ Inline Highlight Pattern

```tsx
<mark className="bg-amber-200/40 dark:bg-amber-400/15 
               hover:bg-amber-300/50 dark:hover:bg-amber-400/25 
               px-1 py-0.5 rounded cursor-pointer 
               transition-all duration-200 relative group">
  <span className="relative inline">
    Highlighted text
    <span className="absolute -top-2 -right-5 opacity-0 
                    group-hover:opacity-100 transition-opacity 
                    pointer-events-none">
      <Icon className="h-3.5 w-3.5 text-amber-600" />
    </span>
  </span>
</mark>
```

---

## 🌗 Dark Mode

All components support dark mode automatically via `dark:` prefix:

```tsx
className="bg-amber-200/40 dark:bg-amber-400/15
           text-foreground dark:text-foreground  
           border-border dark:border-border"
```

---

## 📐 Responsive Patterns

### Hide on Mobile, Show on Desktop
```tsx
<span className="hidden sm:inline">Desktop Only</span>
```

### Show on Mobile, Hide on Desktop
```tsx
<span className="sm:hidden">Mobile Only</span>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
  <div className="xl:col-span-8">{/* Main content */}</div>
  <div className="xl:col-span-4">{/* Sidebar */}</div>
</div>
```

---

## ⚡ Performance Tips

1. **Use CSS transforms** (not position changes)
2. **Batch animations** in same component
3. **Leverage GPU** with transform/opacity
4. **Tree-shake** unused icon imports
5. **Minimize repaints** with will-change

---

## 🎯 Common Use Cases

### Action Button
```tsx
<ModernButton variant="primary" icon={Save}>
  Save Changes
</ModernButton>
```

### Cancel Button
```tsx
<ModernButton variant="ghost">
  Cancel
</ModernButton>
```

### Delete Button
```tsx
<ModernButton variant="danger" icon={Trash2}>
  Delete
</ModernButton>
```

### Metric Display
```tsx
<StatCard 
  icon={Users}
  label="Total Users"
  value="1,234"
  variant="info"
/>
```

### Section with Action
```tsx
<SectionHeader 
  title="Recent Activity"
  icon={Activity}
  badge="New"
  action={<ModernButton size="sm">View All</ModernButton>}
/>
```

---

## 📚 Resources

- Full documentation: `docs/MODERN_UI_DESIGN_SYSTEM.md`
- Component docs: `src/components/ui/modern/README.md`
- Examples: See `BookReader.tsx`
- Improvements log: `BOOKREADER_IMPROVEMENTS.md`

---

**Quick, beautiful, consistent! 🚀**
