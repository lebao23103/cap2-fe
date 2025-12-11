import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Mock popular books data
  const popularBooks = [
    {
      id: '1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    },
    {
      id: '2',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    },
    {
      id: '3',
      title: '1984',
      author: 'George Orwell',
      cover: 'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?w=300&h=400&fit=crop',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-mono relative selection:bg-primary selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="container mx-auto max-w-4xl pt-20 pb-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Animated 404 illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              {/* 404 Text with outline effect */}
              <h1 className="text-9xl sm:text-[12rem] font-black text-foreground mb-4 select-none drop-shadow-[8px_8px_0_rgba(0,0,0,1)] dark:drop-shadow-[8px_8px_0_rgba(255,255,255,1)]"
                style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000' }}>
                404
              </h1>

              {/* Floating book icon */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-8 right-0"
              >
                <BookOpen className="h-16 w-16 text-foreground" strokeWidth={2.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-3xl sm:text-5xl font-black mb-4 uppercase bg-card text-foreground inline-block px-4 py-2 border-4 border-border shadow-neo">
              Page Not Found
            </h2>
            <p className="text-lg font-bold text-muted-foreground max-w-md mx-auto bg-card/80 p-4 border-2 border-border mt-4">
              Oops! It seems the page you're looking for has gone on an adventure.
              Let's help you find your way back.
            </p>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button asChild size="lg" className="gap-2 h-14 px-8 text-lg font-black uppercase bg-primary text-primary-foreground border-4 border-border rounded-lg shadow-neo hover:translate-y-[-4px] hover:shadow-neo-lg hover:bg-primary transition-all">
              <Link to="/">
                <Home className="h-5 w-5" />
                Go to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 h-14 px-8 text-lg font-black uppercase bg-card text-foreground border-4 border-border rounded-lg shadow-neo hover:translate-y-[-4px] hover:shadow-neo-lg hover:bg-card transition-all">
              <Link to="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <Card className="rounded-xl border-4 border-border shadow-neo-lg bg-card max-w-md mx-auto">
              <CardContent className="p-6">
                <h3 className="font-black uppercase mb-4 text-left text-foreground">Search for content</h3>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search books, authors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 rounded-lg border-2 border-border bg-card text-foreground focus-visible:ring-0 focus-visible:border-primary focus-visible:shadow-neo"
                  />
                  <Button type="submit" size="icon" className="rounded-lg border-2 border-border bg-foreground text-background hover:bg-primary hover:text-primary-foreground hover:translate-y-[-2px] hover:shadow-neo transition-all">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular books section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <h3 className="text-2xl font-black uppercase mb-6 text-foreground">Popular Books</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {popularBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1 }}
                >
                  <Link to={`/book/${book.id}`}>
                    <Card className="rounded-xl border-4 border-border shadow-neo-lg hover:translate-y-[-4px] hover:shadow-neo-xl transition-all bg-card overflow-hidden group">
                      <div className="aspect-[2/3] overflow-hidden border-b-4 border-border relative">
                        <img
                          src={book.cover}
                          alt={`${book.title} cover`}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-multiply"></div>
                      </div>
                      <CardContent className="p-4 bg-card">
                        <h4 className="font-bold text-base mb-1 line-clamp-1 uppercase text-foreground">
                          {book.title}
                        </h4>
                        <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                          {book.author}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional help text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-12 text-sm text-muted-foreground"
          >
            <p>
              If you believe this is an error, please{' '}
              <Link to="/contact" className="text-primary hover:underline">
                contact support
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
