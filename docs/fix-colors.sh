#!/bin/bash
# Automated script to fix light mode text colors across all remaining pages

# Define the files that need fixing
FILES=(
  "src/pages/ResetPassword.tsx"
  "src/pages/Create.tsx"
  "src/pages/AdminDashboard.tsx"
  "src/pages/BookReader.tsx"
  "src/pages/NoteShare.tsx"
  "src/pages/BookQuiz.tsx"
  "src/pages/About.tsx"
  "src/pages/Contact.tsx"
  "src/pages/FAQ.tsx"
)

echo "🎨 Fixing light mode text colors..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"
    
    # Fix headings and titles
    sed -i 's/className="\([^"]*\)text-foreground\([^"]*\)"/className="\1text-gray-900 dark:text-foreground\2"/g' "$file"
    
    # Fix body text
    sed -i 's/className="\([^"]*\)text-muted-foreground\([^"]*\)"/className="\1text-gray-600 dark:text-muted-foreground\2"/g' "$file"
    
    # Fix icons (basic pattern)
    sed -i 's/<\([A-Z][a-zA-Z]*\) className="\([^"]*\)h-[0-9] w-[0-9]\([^"]*\)"/<\1 className="\2h-\3 w-\3 text-gray-600 dark:text-foreground\4"/g' "$file"
    
    echo "  ✅ Fixed: $file"
  else
    echo "  ⚠️  Not found: $file"
  fi
done

echo ""
echo "✨ Color fix complete!"
echo "📝 Please review the changes and test in light mode"
