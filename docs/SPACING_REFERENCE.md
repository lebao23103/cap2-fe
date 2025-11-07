# Spacing Reference - Quick Guide

## 🎯 Standard Spacing Values

### **Form Elements**
```tsx
// Field groups
<form className="space-y-2">  // Between fields

// Individual field
<div className="space-y-0.5">  // Label to input
  <Label className="text-sm">  // Label size
  <Input className="h-9" />      // Input height
</div>

// Error messages
<div className="min-h-[12px]">  // Reserved space
  <p className="text-xs">        // Error text size
</div>
```

### **Headers**
```tsx
<CardHeader className="pb-2 pt-6">  // Card header padding
  <div className="mb-1">             // Icon to title gap
    <CardTitle className="text-xl">  // Title size
  </div>
  <p className="text-xs mt-1">       // Description
</CardHeader>
```

### **Buttons**
```tsx
<Button className="h-10" />  // Standard height
<Button className="h-9" />   // Compact height
```

### **Icons**
```tsx
// Toggle icons (password eye)
<Eye className="h-3.5 w-3.5" />

// Header icons
<Icon className="h-4 w-4" />  // Small
<Icon className="h-5 w-5" />  // Medium
<Icon className="h-8 w-8" />  // Hero (in circles)
```

### **Section Spacing**
```tsx
<section className="py-16">   // Standard section
<section className="py-24">   // Hero section
```

### **Footer/Dividers**
```tsx
<div className="mt-4 pt-3 border-t">  // Footer with divider
```

---

## 📏 Common Patterns

### **Auth Forms (Login/Register)**
```tsx
<Card>
  <CardHeader className="pb-2 pt-6">
    <CardTitle className="text-xl">Title</CardTitle>
    <p className="text-xs mt-1">Description</p>
  </CardHeader>
  
  <CardContent className="px-6 pb-6">
    <form className="space-y-2">
      <div className="space-y-0.5">
        <Label className="text-sm">Label</Label>
        <Input className="h-9" />
        <div className="min-h-[12px]">
          {error && <p className="text-xs">{error}</p>}
        </div>
      </div>
      
      <div className="pt-0.5">
        <Button className="h-10 w-full" />
      </div>
    </form>
    
    <div className="mt-4 pt-3 border-t">
      <p className="text-xs">Footer text</p>
    </div>
  </CardContent>
</Card>
```

### **Grid Layouts**
```tsx
// Dashboard
<div className="grid lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">Main</div>
  <div>Sidebar</div>
</div>

// Home featured
<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

// Form columns
<div className="grid grid-cols-2 gap-3">
```

---

## 🎨 Text Sizes

```tsx
// Hierarchy
text-xl    // Titles (card headers)
text-sm    // Labels, body text
text-xs    // Descriptions, helper text, errors

// Icons match text size
h-3.5 w-3.5  // For compact UI (password toggles)
h-4 w-4      // For text-sm elements
h-5 w-5      // For text-base elements
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile first
className="..."              // Mobile (375px+)
className="sm:..."           // Small (640px+)
className="md:..."           // Medium (768px+)
className="lg:..."           // Large (1024px+)
className="xl:..."           // XL (1280px+)
```

---

## ✅ Do's and Don'ts

### **✅ DO:**
- Use `space-y-0.5` for label-to-input
- Use `space-y-2` for field-to-field
- Reserve space for errors (`min-h-[12px]`)
- Use `h-9` for compact inputs
- Use `text-xs` for helper text

### **❌ DON'T:**
- Use `space-y-5` or larger (too loose)
- Skip error space reservation (causes shift)
- Mix `h-full` with fixed heights
- Use `text-sm` for everything
- Forget responsive classes

---

## 🔄 Migration Checklist

When updating an old form:

1. ✅ Header: `pb-8` → `pb-2 pt-6`
2. ✅ Title: `text-3xl` → `text-xl`
3. ✅ Form: `space-y-5` → `space-y-2`
4. ✅ Fields: `space-y-2` → `space-y-0.5`
5. ✅ Inputs: Add `h-9`
6. ✅ Buttons: Add `h-10`, remove `size="lg"`
7. ✅ Icons: `h-4 w-4` → `h-3.5 w-3.5`
8. ✅ Errors: `min-h-[20px]` → `min-h-[12px]`
9. ✅ Footer: `mt-8 pt-6` → `mt-4 pt-3`
10. ✅ Text: `text-sm` → `text-xs` for descriptions

---

**Last Updated:** 2025-10-27  
**Status:** Current standard across Login, Register pages
