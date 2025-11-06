import { 
  BookOpen, 
  Heart, 
  History, 
  Users, 
  BookMarked, 
  SearchX, 
  StickyNote, 
  MessageCircle,
  Filter,
  Plus
} from 'lucide-react';

export const emptyStates = {
  // Dashboard
  noBooksInDashboard: {
    icon: BookOpen,
    title: 'Start Your Reading Journey',
    description: 'Discover amazing books and begin your adventure into knowledge and imagination.',
    action: {
      label: 'Browse Books',
      path: '/',
    },
  },
  
  noContinueReading: {
    icon: BookOpen,
    title: 'No Books in Progress',
    description: 'Start reading a book to see it here.',
    action: {
      label: 'Discover Books',
      path: '/',
    },
  },
  
  // Favorites
  noFavorites: {
    icon: Heart,
    title: 'No Favorites Yet',
    description: 'Save books you love by clicking the heart icon. Your favorites will appear here.',
    action: {
      label: 'Discover Books',
      path: '/',
    },
  },
  
  // Reading History
  noReadingHistory: {
    icon: History,
    title: 'No Reading History',
    description: 'Your reading journey starts here. Begin reading a book to track your progress.',
    action: {
      label: 'Start Reading',
      path: '/',
    },
  },
  
  // Admin - Users
  noUsers: {
    icon: Users,
    title: 'No Users Found',
    description: 'No users match your current filters. Try adjusting your search criteria.',
    action: null,
  },
  
  noUsersAtAll: {
    icon: Users,
    title: 'No Users Yet',
    description: 'Users will appear here once they register on the platform.',
    action: null,
  },
  
  // Admin - Books
  noBooks: {
    icon: BookMarked,
    title: 'No Books in Library',
    description: 'Start building your library by adding books for readers to discover.',
    action: {
      label: 'Add Book',
      path: '/admin/books/add',
    },
  },
  
  noBooksFiltered: {
    icon: Filter,
    title: 'No Books Found',
    description: 'No books match your current filters. Try adjusting your search criteria.',
    action: null,
  },
  
  // Search Results
  noSearchResults: {
    icon: SearchX,
    title: 'No Results Found',
    description: 'We couldn\'t find any books matching your search. Try different keywords or browse our collection.',
    action: {
      label: 'Browse All Books',
      path: '/',
    },
  },
  
  // NoteShare
  noSharedNotes: {
    icon: StickyNote,
    title: 'No Shared Notes',
    description: 'Share your reading insights with the community. Your shared notes will appear here.',
    action: {
      label: 'Create Note',
      path: '/noteshare/create',
    },
  },
  
  noNotesForBook: {
    icon: StickyNote,
    title: 'No Notes Yet',
    description: 'Be the first to share your thoughts about this book.',
    action: {
      label: 'Create Note',
      path: '/noteshare/create',
    },
  },
  
  // Chatbot
  chatbotInitial: {
    icon: MessageCircle,
    title: 'Start a Conversation',
    description: 'Ask me anything about books, get recommendations, or discuss what you\'re reading.',
    action: null,
  },
  
  // Generic empty states
  noData: {
    icon: BookOpen,
    title: 'No Data Available',
    description: 'There\'s nothing to display right now. Check back later.',
    action: null,
  },
  
  noContent: {
    icon: BookOpen,
    title: 'No Content',
    description: 'This section is empty at the moment.',
    action: null,
  },
} as const;

// Helper type for empty state keys
export type EmptyStateKey = keyof typeof emptyStates;
