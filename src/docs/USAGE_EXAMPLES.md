# Usage Examples: Loading States & Empty States

## Loading States

### Basic Usage

```tsx
import { BookGridSkeleton, DashboardSkeleton } from '@/components/ui/loading-state';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      {/* Your dashboard content */}
    </div>
  );
}
```

### Available Skeleton Components

- `BookCardSkeleton` - Single book card
- `BookGridSkeleton` - Grid of book cards (customizable count)
- `StatCardSkeleton` - Dashboard stat card
- `ListItemSkeleton` - Single list item
- `ListSkeleton` - List of items (customizable count)
- `TableSkeleton` - Complete table with header/rows
- `ProfileHeaderSkeleton` - Profile header with avatar
- `TimelineSkeleton` - Activity timeline
- `FormSkeleton` - Form with multiple fields
- `DashboardSkeleton` - Complete dashboard layout
- `BookDetailHeroSkeleton` - Book detail hero section
- `PageSkeleton` - Generic full page skeleton

### Custom Count Examples

```tsx
// Show 8 book cards
<BookGridSkeleton count={8} />

// Show 10 list items
<ListSkeleton count={10} />

// Show table with 5 rows and 6 columns
<TableSkeleton rows={5} columns={6} />
```

## Empty States

### Using the Hook (Recommended)

```tsx
import { useEmptyState } from '@/hooks/useEmptyState';

function Favorites() {
  const { renderEmptyState } = useEmptyState();
  const favorites = []; // Your data

  if (favorites.length === 0) {
    return renderEmptyState('noFavorites');
  }

  return (
    <div>
      {/* Your favorites list */}
    </div>
  );
}
```

### Using with Custom Action

```tsx
function CustomPage() {
  const { renderEmptyState } = useEmptyState();

  return renderEmptyState('noBooks', {
    label: 'Custom Action',
    onClick: () => console.log('Custom action!'),
  });
}
```

### Direct Component Usage

```tsx
import { EmptyState } from '@/components/ui/empty-state';
import { Heart } from 'lucide-react';

function CustomEmpty() {
  return (
    <EmptyState
      icon={Heart}
      title="No Favorites"
      description="Start adding books to your favorites!"
      action={{
        label: 'Browse Books',
        onClick: () => navigate('/'),
      }}
    />
  );
}
```

### Available Empty State Keys

- `noBooksInDashboard` - Dashboard with no books
- `noContinueReading` - No books in progress
- `noFavorites` - No favorite books
- `noReadingHistory` - No reading history
- `noUsers` - Admin: No users found (filtered)
- `noUsersAtAll` - Admin: No users registered
- `noBooks` - Admin: No books in library
- `noBooksFiltered` - Admin: No books match filter
- `noSearchResults` - Search returned no results
- `noSharedNotes` - No shared notes
- `noNotesForBook` - No notes for specific book
- `chatbotInitial` - Chatbot welcome message
- `noData` - Generic no data
- `noContent` - Generic no content

## Complete Example: Dashboard with Loading & Empty States

```tsx
import { useState, useEffect } from 'react';
import { DashboardSkeleton, BookGridSkeleton } from '@/components/ui/loading-state';
import { useEmptyState } from '@/hooks/useEmptyState';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const { renderEmptyState } = useEmptyState();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBooks([]); // or fetch from API
      setLoading(false);
    }, 1000);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <DashboardSkeleton />
      </div>
    );
  }

  // Empty state
  if (books.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {renderEmptyState('noBooksInDashboard')}
        </div>
      </div>
    );
  }

  // Success state with data
  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1>Dashboard</h1>
        {/* Render books */}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Always Show Loading States
```tsx
// ✅ Good
if (loading) return <DashboardSkeleton />;

// ❌ Bad
if (loading) return <div>Loading...</div>;
```

### 2. Use Appropriate Skeleton Counts
```tsx
// ✅ Good - Match expected data count
<BookGridSkeleton count={6} /> // If you typically show 6 books

// ❌ Bad - Too many or too few skeletons
<BookGridSkeleton count={100} />
```

### 3. Provide Actionable Empty States
```tsx
// ✅ Good - Guides user to next action
renderEmptyState('noFavorites') // Has "Discover Books" button

// ❌ Bad - Dead end
<EmptyState title="No data" /> // No action button
```

### 4. Match Layout in Loading States
```tsx
// ✅ Good - Skeleton matches actual layout
if (loading) return <DashboardSkeleton />; // Has stats + grid
return <Dashboard />; // Actual component has stats + grid

// ❌ Bad - Different layouts
if (loading) return <PageSkeleton />; // Generic skeleton
return <ComplexDashboard />; // Complex custom layout
```
