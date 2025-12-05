import { useState } from 'react';
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
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = async () => {
    await logout();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navItems = isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chatbot', label: 'AI Assistant', icon: MessageCircle },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/reading-history', label: 'History', icon: Clock },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: Shield }] : [])
  ] : [];

  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-black">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white dark:bg-zinc-900" role="banner">
        <div className="container mx-auto relative px-4">
          <nav className="flex h-20 items-center justify-between gap-4" role="navigation" aria-label="Main navigation">
            {/* Left Side - Logo */}
            <div className="flex items-center">
              <Link to="/" className="group flex items-center gap-3 transition-all duration-300 hover:-translate-y-1" aria-label="Knowly home">
                <div className="relative h-12 w-12 border-4 border-black bg-primary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <BookOpen className="h-6 w-6 text-black" strokeWidth={3} />
                </div>
                <span className="font-display text-3xl font-black uppercase tracking-tighter text-black dark:text-white">
                  Knowly
                </span>
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden md:flex items-center justify-center flex-1">
              <div className="flex items-center gap-2">
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
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase border-2 transition-all duration-200 ${isActivePath(item.path)
                      ? 'bg-primary border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                      : 'border-transparent text-gray-600 hover:border-black hover:text-black hover:bg-gray-100'
                      }`}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={2.5} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Side - Auth Actions */}
            <div className="flex items-center justify-end gap-4">
              {/* Theme Toggle */}
              <div className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ThemeToggle />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-12 w-12 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>

              {isAuthenticated ? (
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-3 h-12 px-4 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-zinc-800">
                        <Avatar className="h-8 w-8 border-2 border-black rounded-none">
                          <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                          <AvatarFallback className="bg-primary text-black font-bold rounded-none">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold uppercase max-w-[120px] truncate">
                          {user?.first_name}
                        </span>
                        <ChevronDown className="h-4 w-4" strokeWidth={3} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-0 mt-2">
                      <DropdownMenuLabel className="p-4 bg-primary border-b-4 border-black">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black uppercase">
                            {user?.first_name} {user?.last_name}
                          </p>
                          <p className="text-xs font-mono text-black/80">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <div className="p-2 bg-white dark:bg-zinc-900">
                        <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')} className="font-bold uppercase focus:bg-black focus:text-white rounded-none cursor-pointer py-3">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          <span>{isAdmin ? 'Admin Panel' : 'Dashboard'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black h-0.5 my-2" />
                        <DropdownMenuItem onClick={handleLogout} className="font-bold uppercase text-red-600 focus:bg-red-600 focus:text-white rounded-none cursor-pointer py-3">
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
                      className="h-12 px-6 font-bold uppercase border-2 border-transparent hover:border-black hover:bg-transparent rounded-none transition-all"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button
                      className="h-12 px-8 bg-black text-white font-bold uppercase border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-primary hover:text-black transition-all"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t-4 border-black bg-white dark:bg-zinc-900 absolute left-0 right-0 top-full shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
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
                      ? 'bg-primary border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-transparent hover:border-black hover:bg-gray-100'
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
                          ? 'bg-primary border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-transparent hover:border-black hover:bg-gray-100'
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="h-1 bg-black my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-base font-bold uppercase text-red-600 border-2 border-transparent hover:border-black hover:bg-red-50 w-full text-left"
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
                        <Button className="w-full h-12 font-bold uppercase border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full h-12 font-bold uppercase border-2 border-black bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {!isAuthenticated && (
        <footer className="border-t-4 border-black bg-white dark:bg-zinc-900 py-16" role="contentinfo">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Company Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 border-4 border-black bg-primary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <BookOpen className="h-5 w-5 text-black" strokeWidth={3} />
                  </div>
                  <h3 className="font-display text-2xl font-black uppercase tracking-tighter">
                    Knowly
                  </h3>
                </div>
                <p className="font-mono text-sm font-medium leading-relaxed max-w-xs">
                  Knowledge Sharing Platform for Academic Reading and Exercises. Built for the bold.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold uppercase">
                  <span>© 2025 Knowly.</span>
                  <span className="text-primary">⚡</span>
                  <span>All rights reserved.</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h4 className="font-display text-xl font-black uppercase bg-black text-white inline-block px-2 py-1 transform -rotate-1">Contact Us</h4>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📧</span>
                    <div>
                      <p className="font-bold uppercase">Email</p>
                      <p className="text-gray-600">support@knowly.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="font-bold uppercase">Phone</p>
                      <p className="text-gray-600">+84 (028) 1234-5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-bold uppercase">Address</p>
                      <p className="text-gray-600">123 Knowledge Street, Learning City</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="font-display text-xl font-black uppercase bg-black text-white inline-block px-2 py-1 transform rotate-1">Quick Links</h4>
                <div className="space-y-3 font-bold uppercase text-sm">
                  <Link
                    to="/about"
                    className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                  >
                    <span className="h-2 w-2 bg-black" />
                    <span>About Us</span>
                  </Link>
                  <Link
                    to="/faq"
                    className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                  >
                    <span className="h-2 w-2 bg-black" />
                    <span>FAQ</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="flex items-center gap-2 hover:translate-x-2 transition-transform"
                  >
                    <span className="h-2 w-2 bg-black" />
                    <span>Contact Form</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Divider */}
            <div className="mt-16 pt-8 border-t-4 border-black">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-xs font-bold uppercase">
                <p>Empowering learners worldwide.</p>
                <div className="flex items-center gap-6">
                  <Link to="/privacy" className="hover:bg-primary hover:text-black px-1 transition-colors">Privacy Policy</Link>
                  <span className="text-black/30">|</span>
                  <Link to="/terms" className="hover:bg-primary hover:text-black px-1 transition-colors">Terms of Service</Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Global Floating Chat Widget */}
      <ChatWidget />
    </div>
  );
}