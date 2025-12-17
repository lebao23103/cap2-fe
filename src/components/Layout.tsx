import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import { ChatWidget } from './ChatWidget';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  LayoutDashboard,
  MessageCircle,
  Heart,
  Clock,
  Shield,
  Home,
  Library,
  Plus,
  Sparkles,
  Info,
  X,
  Menu,
  BookOpen,
  ChevronDown,
  LogOut,
  StickyNote,
} from 'lucide-react';
import { useHeartbeat } from '../hooks/useHeartbeat';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useHeartbeat(); // Keep session alive
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > 20;
    }
    return false;
  });
  const [isNavigating, setIsNavigating] = useState(true);

  // Handle scroll events with RAF for performance
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          // Add hysteresis to prevent flickering at the threshold
          // Only switch state if we've moved significantly past the threshold
          if (scrollY > 50) {
            setIsScrolled(true);
          } else if (scrollY < 20) {
            setIsScrolled(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle route changes to prevent animation
  useEffect(() => {
    setIsNavigating(true);
    // Ensure accurate scroll state on navigation
    setIsScrolled(window.scrollY > 20);
    const timer = setTimeout(() => setIsNavigating(false), 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // ... (navItems logic)

  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chatbot', label: 'AI Assistant', icon: MessageCircle },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/reading-history', label: 'History', icon: Clock },
    { path: '/my-notes', label: 'My Notes', icon: StickyNote },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : [])
  ] : [];

  // Check if current page is BookReader - hide main navbar on this page
  const isBookReaderPage = location.pathname.includes('/book/') && location.pathname.includes('/read');

  // Don't render header on BookReader page
  if (isBookReaderPage) {
    return (
      <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-black">
        <main className="flex-1">
          {children}
        </main>
        <ChatWidget />
      </div>
    );
  }

  const springTransition = {
    type: "spring" as const,
    stiffness: 250,
    damping: 30, // No bounce, just fast snap
    mass: 1
  };

  const noTransition = {
    duration: 0
  };

  /* 
   * Restore robust layout animation with performance optimizations.
   * - Use 'layout' for smooth size/position transitions.
   * - Use conditional classNames for styling ease.
   * - Removed translateZ(0) to fix text blurriness (sub-pixel rendering issue).
   */
  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-black">
      {/* Header/Navigation */}
      <motion.header
        layout
        initial={false}
        transition={isNavigating ? noTransition : springTransition}
        className={`sticky top-0 z-50 mx-auto ${isScrolled
          ? 'top-4 w-[95%] max-w-7xl rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md shadow-md'
          : 'w-full border-b-4 border-border bg-background rounded-none'
          }`}
        style={{
          willChange: 'width, top', // Reduced will-change surface area
        }}
        role="banner"
      >
        <motion.div
          initial={false}
          animate={{
            paddingLeft: isScrolled ? "1.5rem" : "1rem",
            paddingRight: isScrolled ? "1.5rem" : "1rem",
            maxWidth: isScrolled ? "80rem" : "100%"
          }}
          transition={isNavigating ? noTransition : springTransition}
          className="container mx-auto"
        >
          <motion.nav
            initial={false}
            animate={{
              height: isScrolled ? "4rem" : "5rem"
            }}
            transition={isNavigating ? noTransition : springTransition}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-4"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Left Side - Logo */}
            <div className="flex items-center justify-self-start">
              <Link to="/" className="group flex items-center gap-3 transition-all duration-300 hover:-translate-y-1" aria-label="Knowly home">
                <div className="relative h-10 w-10 border-4 border-border bg-primary flex items-center justify-center shadow-neo-sm group-hover:shadow-neo transition-all rounded-xl">
                  <BookOpen className="h-5 w-5 text-black" strokeWidth={3} />
                </div>
                <span className="font-display text-2xl font-black uppercase tracking-tighter text-foreground">
                  Knowly
                </span>
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden md:flex items-center justify-center justify-self-center">
              <div className="flex items-center gap-1 p-1">
                {[
                  { path: '/', label: 'Home', icon: Home },
                  { path: '/readnex', label: 'ReadNEx', icon: Library },
                  { path: '/create', label: 'Create', icon: Plus },
                  { path: '/noteshare', label: 'NoteShare', icon: Sparkles },
                  { path: '/about', label: 'About', icon: Info },
                ].map((item) => {
                  const active = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center justify-center gap-2 px-5 h-10 text-sm font-black uppercase tracking-wide transition-all duration-200 rounded-lg select-none ${active
                        ? 'bg-primary text-black border-2 border-black shadow-neo-sm'
                        : 'text-muted-foreground dark:text-foreground/70 border-2 border-transparent hover:text-foreground hover:bg-muted'
                        }`}
                    >
                      <item.icon className={`w-4 h-4 ${active ? "stroke-[3px]" : "stroke-[2.5px]"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Auth Actions */}
            <div className="flex items-center justify-end gap-4 justify-self-end">
              {/* Theme Toggle */}
              <div className="border-border shadow-neo-sm rounded-lg">
                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 border-2 border-border rounded-lg shadow-neo-sm active:translate-y-1 active:shadow-none transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-3 h-10 px-4 border-2 border-border rounded-lg shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo transition-all bg-background">
                        <Avatar className="h-7 w-7 border-2 border-border rounded-lg">
                          <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                          <AvatarFallback className="bg-primary text-black font-bold rounded-lg">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold uppercase max-w-[120px] truncate text-sm">
                          {user?.first_name}
                        </span>
                        <ChevronDown className="h-4 w-4" strokeWidth={3} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 border-4 border-border rounded-lg shadow-neo-lg p-0 mt-2">
                      <DropdownMenuLabel className="p-4 bg-primary border-b-4 border-border text-primary-foreground">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black uppercase">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs font-mono text-black/80">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <div className="p-2 bg-background border-t-0">
                        <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')} className="font-bold uppercase focus:bg-black focus:text-white rounded-md cursor-pointer py-3">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          <span>{isAdmin ? 'Admin Panel' : 'Dashboard'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border h-0.5 my-2" />
                        <DropdownMenuItem onClick={handleLogout} className="font-bold uppercase text-red-600 focus:bg-red-600 focus:text-white rounded-md cursor-pointer py-3">
                          <LogOut className="mr-3 h-4 w-4" />
                          <span>Log out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link to="/login">
                    <Button
                      variant="ghost"
                      className="h-10 px-5 font-bold uppercase rounded-lg hover:bg-transparent transition-all text-sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      className="h-10 px-6 bg-foreground text-background font-bold uppercase border-2 border-border rounded-lg shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo hover:bg-primary hover:text-primary-foreground transition-all text-sm"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-4 border-border bg-background absolute left-0 right-0 top-full shadow-neo text-foreground">
              <div className="flex flex-col p-4 space-y-2">
                {[
                  { path: '/', label: 'Home', icon: Home },
                  { path: '/readnex', label: 'ReadNEx', icon: Library },
                  { path: '/create', label: 'Create', icon: Plus },
                  { path: '/noteshare', label: 'NoteShare', icon: Sparkles },
                  { path: '/about', label: 'About', icon: Info },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-base font-bold uppercase border-2 transition-all ${isActivePath(item.path)
                      ? 'bg-primary border-border text-primary-foreground shadow-neo'
                      : 'border-transparent hover:border-border hover:bg-muted'
                      }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <div className="h-1 bg-black my-2" />
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 text-base font-bold uppercase border-2 transition-all ${isActivePath(item.path)
                          ? 'bg-primary border-border text-primary-foreground shadow-neo'
                          : 'border-transparent hover:border-border hover:bg-muted'
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="h-1 bg-black my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-base font-bold uppercase text-red-600 border-2 border-transparent hover:border-border hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <div className="h-1 bg-black my-2" />
                    <div className="flex flex-col gap-3">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full h-12 font-bold uppercase border-2 border-border bg-background text-foreground shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo rounded-lg">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full h-12 font-bold uppercase border-2 border-border bg-primary text-primary-foreground shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo rounded-lg">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.header >

      {/* Main Content */}
      < main className="flex-1" >
        {children}
      </main >

      {/* Footer */}
      {
        !isAuthenticated && (
          <footer className="border-t-4 border-border bg-background py-16" role="contentinfo">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-12">
                {/* Company Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 border-4 border-border bg-primary flex items-center justify-center shadow-neo">
                      <BookOpen className="h-5 w-5 text-black" strokeWidth={3} />
                    </div>
                    <h3 className="font-display text-2xl font-black uppercase tracking-tighter">
                      Knowly
                    </h3>
                  </div>
                  <p className="font-mono text-sm font-medium leading-relaxed max-w-xs text-muted-foreground">
                    Knowledge Sharing Platform for Academic Reading and Exercises. Built for the bold.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold uppercase text-muted-foreground">
                    <span>© 2025 Knowly.</span>
                    <span className="text-primary">⚡</span>
                    <span>All rights reserved.</span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h4 className="font-display text-xl font-black uppercase bg-foreground text-background inline-block px-2 py-1 transform -rotate-1">Contact Us</h4>
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📧</span>
                      <div>
                        <p className="font-bold uppercase text-foreground">Email</p>
                        <p className="text-muted-foreground">support@knowly.com</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="font-bold uppercase text-foreground">Phone</p>
                        <p className="text-muted-foreground">+84 (028) 1234-5678</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-xl">📍</span>
                      <div>
                        <p className="font-bold uppercase text-foreground">Address</p>
                        <p className="text-muted-foreground">123 Knowledge Street, Learning City</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                  <h4 className="font-display text-xl font-black uppercase bg-foreground text-background inline-block px-2 py-1 transform rotate-1">Quick Links</h4>
                  <div className="space-y-3 font-bold uppercase text-sm">
                    <Link
                      to="/about"
                      className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                    >
                      <span className="h-2 w-2 bg-foreground" />
                      <span>About Us</span>
                    </Link>
                    <Link
                      to="/faq"
                      className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                    >
                      <span className="h-2 w-2 bg-foreground" />
                      <span>FAQ</span>
                    </Link>
                    <Link
                      to="/contact"
                      className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                    >
                      <span className="h-2 w-2 bg-foreground" />
                      <span>Contact Form</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Divider */}
              <div className="mt-16 pt-8 border-t-4 border-border">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs font-bold uppercase">
                  <p>Empowering learners worldwide.</p>
                  <div className="flex items-center gap-6">
                    <Link to="/privacy" className="hover:bg-primary hover:text-black px-1 transition-colors">Privacy Policy</Link>
                    <span className="text-muted-foreground">|</span>
                    <Link to="/terms" className="hover:bg-primary hover:text-black px-1 transition-colors">Terms of Service</Link>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )
      }

      {/* Global Floating Chat Widget */}
      <ChatWidget />
    </div >
  );
}