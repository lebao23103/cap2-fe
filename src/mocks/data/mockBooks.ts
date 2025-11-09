/**
 * Mock Book Data
 * Realistic book catalog for MSW handlers
 */

export interface MockBook {
  id: number
  title: string
  author: string
  language?: string
  subject?: string
  description: string
  cover_image?: string
  rating: number
  reviews_count: number
  created_at: string
  updated_at: string
  is_approved: boolean
  created_by?: number
  pages?: number
  pdf_file?: string
  isbn?: string
  publisher?: string
  publication_date?: string
}

export interface MockReview {
  id: number
  book: number
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  rating: number
  comment: string
  created_at: string
}

/**
 * Generate placeholder cover image URL
 */
function getCoverUrl(bookId: number): string {
  return `https://picsum.photos/seed/book${bookId}/300/450`
}

/**
 * Mock Books Catalog
 */
export const mockBooks: MockBook[] = [
  {
    id: 1,
    title: 'The Midnight Library',
    author: 'Matt Haig',
    language: 'English',
    subject: 'Fiction',
    description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.',
    cover_image: getCoverUrl(1),
    rating: 4.5,
    reviews_count: 248,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    is_approved: true,
    pages: 304,
    pdf_file: '/media/books/midnight-library.pdf',
    publication_date: '2020-08-13',
  },
  {
    id: 2,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    language: 'English',
    subject: 'Classic Fiction',
    description: 'The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby.',
    cover_image: getCoverUrl(2),
    rating: 4.7,
    reviews_count: 532,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
    is_approved: true,
    pages: 180,
    pdf_file: '/media/books/great-gatsby.pdf',
    publication_date: '1925-04-10',
  },
  {
    id: 3,
    title: '1984',
    author: 'George Orwell',
    language: 'English',
    subject: 'Dystopian Fiction',
    description: 'A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism. The novel is set in Airstrip One, a province of the superstate Oceania.',
    cover_image: getCoverUrl(3),
    rating: 4.8,
    reviews_count: 892,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-05T12:00:00Z',
    is_approved: true,
    pages: 328,
    pdf_file: '/media/books/1984.pdf',
    publication_date: '1949-06-08',
  },
  {
    id: 4,
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    language: 'English',
    subject: 'Classic Fiction',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. To Kill a Mockingbird became both an instant bestseller and a critical success.',
    cover_image: getCoverUrl(4),
    rating: 4.9,
    reviews_count: 1024,
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-08T09:00:00Z',
    is_approved: true,
    pages: 336,
    pdf_file: '/media/books/to-kill-mockingbird.pdf',
    publication_date: '1960-07-11',
  },
  {
    id: 5,
    title: 'Dune',
    author: 'Frank Herbert',
    language: 'English',
    subject: 'Science Fiction',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    cover_image: getCoverUrl(5),
    rating: 4.6,
    reviews_count: 678,
    created_at: '2024-01-12T14:00:00Z',
    updated_at: '2024-01-12T14:00:00Z',
    is_approved: true,
    pages: 688,
    pdf_file: '/media/books/dune.pdf',
    publication_date: '1965-06-01',
  },
  {
    id: 6,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    language: 'English',
    subject: 'Romance',
    description: 'Pride and Prejudice follows the turbulent relationship between Elizabeth Bennet and Mr. Darcy. A classic of English literature, it is a masterpiece of wit, social observation, and character.',
    cover_image: getCoverUrl(6),
    rating: 4.7,
    reviews_count: 456,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    is_approved: true,
    pages: 432,
    pdf_file: '/media/books/pride-prejudice.pdf',
    publication_date: '1813-01-28',
  },
  {
    id: 7,
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    language: 'English',
    subject: 'Fantasy',
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep.',
    cover_image: getCoverUrl(7),
    rating: 4.8,
    reviews_count: 834,
    created_at: '2024-01-18T11:00:00Z',
    updated_at: '2024-01-18T11:00:00Z',
    is_approved: true,
    pages: 310,
    pdf_file: '/media/books/hobbit.pdf',
    publication_date: '1937-09-21',
  },
  {
    id: 8,
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    language: 'English',
    subject: 'Fiction',
    description: 'The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield who has been expelled from various schools.',
    cover_image: getCoverUrl(8),
    rating: 4.2,
    reviews_count: 542,
    created_at: '2024-01-22T13:00:00Z',
    updated_at: '2024-01-22T13:00:00Z',
    is_approved: true,
    pages: 277,
    pdf_file: '/media/books/catcher-rye.pdf',
    publication_date: '1951-07-16',
  },
  {
    id: 9,
    title: 'Harry Potter and the Philosopher\'s Stone',
    author: 'J.K. Rowling',
    language: 'English',
    subject: 'Fantasy',
    description: 'Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility.',
    cover_image: getCoverUrl(9),
    rating: 4.9,
    reviews_count: 1567,
    created_at: '2024-01-25T09:00:00Z',
    updated_at: '2024-01-25T09:00:00Z',
    is_approved: true,
    pages: 223,
    pdf_file: '/media/books/harry-potter-1.pdf',
    publication_date: '1997-06-26',
  },
  {
    id: 10,
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    language: 'English',
    subject: 'Fantasy',
    description: 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths.',
    cover_image: getCoverUrl(10),
    rating: 4.9,
    reviews_count: 2341,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    is_approved: true,
    pages: 1178,
    pdf_file: '/media/books/lotr.pdf',
    publication_date: '1954-07-29',
  },
  // Adding 40 more books for variety
  {
    id: 11,
    title: 'Brave New World',
    author: 'Aldous Huxley',
    language: 'English',
    subject: 'Dystopian Fiction',
    description: 'Aldous Huxley\'s profoundly important classic of world literature, Brave New World is a searching vision of an unequal, technologically-advanced future.',
    cover_image: getCoverUrl(11),
    rating: 4.4,
    reviews_count: 387,
    created_at: '2024-02-05T11:00:00Z',
    updated_at: '2024-02-05T11:00:00Z',
    is_approved: true,
    pages: 268,
    pdf_file: '/media/books/brave-new-world.pdf',
    publication_date: '1932-01-01',
  },
  {
    id: 12,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    language: 'English',
    subject: 'Fiction',
    description: 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
    cover_image: getCoverUrl(12),
    rating: 4.3,
    reviews_count: 623,
    created_at: '2024-02-08T12:00:00Z',
    updated_at: '2024-02-08T12:00:00Z',
    is_approved: true,
    pages: 208,
    pdf_file: '/media/books/alchemist.pdf',
    publication_date: '1988-01-01',
  },
  {
    id: 13,
    title: 'Animal Farm',
    author: 'George Orwell',
    language: 'English',
    subject: 'Political Satire',
    description: 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice, and equality.',
    cover_image: getCoverUrl(13),
    rating: 4.6,
    reviews_count: 745,
    created_at: '2024-02-10T14:00:00Z',
    updated_at: '2024-02-10T14:00:00Z',
    is_approved: true,
    pages: 112,
    pdf_file: '/media/books/animal-farm.pdf',
    publication_date: '1945-08-17',
  },
  {
    id: 14,
    title: 'The Chronicles of Narnia',
    author: 'C.S. Lewis',
    language: 'English',
    subject: 'Fantasy',
    description: 'Four adventurous siblings step through a wardrobe door and into the land of Narnia, a land frozen in eternal winter and enslaved by the power of the White Witch.',
    cover_image: getCoverUrl(14),
    rating: 4.7,
    reviews_count: 892,
    created_at: '2024-02-12T09:00:00Z',
    updated_at: '2024-02-12T09:00:00Z',
    is_approved: true,
    pages: 767,
    pdf_file: '/media/books/narnia.pdf',
    publication_date: '1950-10-16',
  },
  {
    id: 15,
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    language: 'English',
    subject: 'Thriller',
    description: 'While in Paris, Harvard symbologist Robert Langdon is awakened by a phone call in the dead of the night. The elderly curator of the Louvre has been murdered inside the museum.',
    cover_image: getCoverUrl(15),
    rating: 4.1,
    reviews_count: 1234,
    created_at: '2024-02-15T10:00:00Z',
    updated_at: '2024-02-15T10:00:00Z',
    is_approved: true,
    pages: 454,
    pdf_file: '/media/books/da-vinci-code.pdf',
    publication_date: '2003-03-18',
  },
]

/**
 * Generate more books dynamically for pagination testing
 */
export function generateMockBooks(count: number, startId: number = 16): MockBook[] {
  const genres = ['Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Romance', 'Thriller', 'Non-Fiction']
  const authors = ['John Smith', 'Jane Doe', 'Alex Johnson', 'Sarah Williams', 'Michael Brown', 'Emily Davis']
  
  return Array.from({ length: count }, (_, i) => ({
    id: startId + i,
    title: `Book Title ${startId + i}`,
    author: authors[i % authors.length],
    language: 'English',
    subject: genres[i % genres.length],
    description: `This is a compelling ${genres[i % genres.length].toLowerCase()} novel that explores complex themes and engaging characters.`,
    cover_image: getCoverUrl(startId + i),
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    reviews_count: Math.floor(Math.random() * 500),
    created_at: new Date(2024, 0, 1 + i).toISOString(),
    updated_at: new Date(2024, 0, 1 + i).toISOString(),
    is_approved: true,
    pages: 200 + Math.floor(Math.random() * 400),
    pdf_file: `/media/books/book-${startId + i}.pdf`,
    publication_date: `20${10 + Math.floor(Math.random() * 15)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
  }))
}

// Add more books to reach 50+
mockBooks.push(...generateMockBooks(35, 16))

/**
 * Mock Reviews Data
 */
export const mockReviews: MockReview[] = [
  {
    id: 1,
    book: 1,
    user: {
      id: 1,
      first_name: 'Demo',
      last_name: 'User',
      email: 'demo@knowly.com',
    },
    rating: 5,
    comment: 'Absolutely loved this book! The concept of the Midnight Library is fascinating and the execution is perfect. Matt Haig has created something truly special here.',
    created_at: '2024-01-16T14:30:00Z',
  },
  {
    id: 2,
    book: 1,
    user: {
      id: 3,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
    },
    rating: 4,
    comment: 'A thought-provoking read that makes you question your life choices. Well-written and emotionally engaging.',
    created_at: '2024-01-18T09:15:00Z',
  },
  {
    id: 3,
    book: 2,
    user: {
      id: 2,
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@knowly.com',
    },
    rating: 5,
    comment: 'A timeless classic. Fitzgerald\'s prose is beautiful and the story of Jay Gatsby remains relevant today.',
    created_at: '2024-01-19T11:00:00Z',
  },
]

/**
 * Find book by ID
 */
export function findBookById(id: number): MockBook | undefined {
  return mockBooks.find(book => book.id === id)
}

/**
 * Find books by author
 */
export function findBooksByAuthor(authorName: string): MockBook[] {
  const searchTerm = authorName.toLowerCase()
  return mockBooks.filter(book => 
    book.author.toLowerCase().includes(searchTerm)
  )
}

/**
 * Search books by title or author
 */
export function searchBooks(query: string): MockBook[] {
  const searchTerm = query.toLowerCase()
  return mockBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm) ||
    book.author.toLowerCase().includes(searchTerm) ||
    book.subject?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get reviews for a book
 */
export function getReviewsByBookId(bookId: number): MockReview[] {
  return mockReviews.filter(review => review.book === bookId)
}

/**
 * Add a review
 */
export function addReview(review: Omit<MockReview, 'id'>): MockReview {
  const newReview = {
    ...review,
    id: mockReviews.length + 1,
  }
  mockReviews.push(newReview)
  
  // Update book review count and rating
  const book = findBookById(review.book)
  if (book) {
    book.reviews_count += 1
    const allReviews = getReviewsByBookId(review.book)
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    book.rating = Number(avgRating.toFixed(1))
  }
  
  return newReview
}

/**
 * Paginate books
 */
export function paginateBooks(
  books: MockBook[],
  page: number = 1,
  limit: number = 10
): { books: MockBook[]; total: number; page: number; totalPages: number } {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedBooks = books.slice(startIndex, endIndex)
  
  return {
    books: paginatedBooks,
    total: books.length,
    page,
    totalPages: Math.ceil(books.length / limit),
  }
}

/**
 * Calculate rating statistics
 */
export function getRatingStatistics(): {
  rates: Record<number, number>
  average_rating: number
} {
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  mockReviews.forEach(review => {
    ratingCounts[review.rating]++
  })
  
  const totalReviews = mockReviews.length
  const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0
  
  return {
    rates: ratingCounts,
    average_rating: Number(averageRating.toFixed(2)),
  }
}
