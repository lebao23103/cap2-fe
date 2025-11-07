# New Routes to Add to App.tsx

## New Pages Created

1. ✅ **Search.tsx** - Search/Browse page with filters
2. ✅ **EmailVerification.tsx** - Email verification with resend

## Routes to Add to App.tsx

Add these imports at the top:

```tsx
import Search from './pages/Search'
import EmailVerification from './pages/EmailVerification'
```

Add these routes in the Routes section:

```tsx
{/* Search/Browse */}
<Route path="/search" element={<Search />} />
<Route path="/browse" element={<Search />} />

{/* Email Verification */}
<Route path="/verify-email/:token" element={<EmailVerification />} />
```

## Complete Route Structure

After adding new pages, your route structure should look like:

```tsx
<Routes>
  {/* Public Marketing Pages */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/faq" element={<FAQ />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
  
  {/* Feature Pages */}
  <Route path="/readnex" element={<ReadNEx />} />
  <Route path="/noteshare" element={<NoteShare />} />
  <Route path="/book/:id" element={<BookDetail />} />
  <Route path="/book/:id/read" element={<BookReader />} />
  <Route path="/book/:id/quiz" element={<BookQuiz />} />
  <Route path="/create" element={<Create />} />
  
  {/* NEW: Search/Browse */}
  <Route path="/search" element={<Search />} />
  <Route path="/browse" element={<Search />} />
  
  {/* Authentication Pages */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/forgot-password" element={<ResetPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  
  {/* NEW: Email Verification */}
  <Route path="/verify-email/:token" element={<EmailVerification />} />
  
  {/* Protected User Pages */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/chatbot" element={
    <ProtectedRoute>
      <Chatbot />
    </ProtectedRoute>
  } />
  <Route path="/favorites" element={
    <ProtectedRoute>
      <Favorites />
    </ProtectedRoute>
  } />
  <Route path="/reading-history" element={
    <ProtectedRoute>
      <ReadingHistory />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />
  <Route path="/settings" element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  } />
  
  {/* Protected Admin Pages */}
  <Route path="/admin" element={
    <ProtectedRoute requireAdmin={true}>
      <AdminDashboard />
    </ProtectedRoute>
  } />
  
  {/* 404 Catch-all Route */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Navigation Links to Add

Add to the navbar (Layout.tsx):

1. **Search Icon/Button** - Links to `/search`
2. **Browse** - Links to `/browse` or `/search`

## User Flow Complete

### Guest User Flow
1. Home → Search → Book Detail → Register → Email Verification → Dashboard ✅

### Registered User Flow
1. Login → Dashboard → Search → Book Detail → Read ✅

### Admin Flow
1. Login → Admin Dashboard → (manage content) ✅

## Next Steps

1. Add routes to App.tsx
2. Add search bar to navbar (Layout.tsx)
3. Update Register.tsx to show "check your email" message
4. Test the complete flow
