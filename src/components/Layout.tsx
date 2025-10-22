import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ChatWidget } from '@/components/ChatWidget';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Heart,
  Clock,
  MessageCircle,
  LayoutDashboard,
  Shield,
  Menu,
  X,
  Home,
  Library,
  Plus,
  Sparkles,
  Info
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
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
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Fixed Position Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left Side - Logo */}
            <div className="flex items-center">
              <Link to="/" className="group flex items-center space-x-2 transition-all duration-300">
                {/* Modern Logo */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-2xl font-bold text-foreground tracking-tight">
                    Knowly
                  </span>
                  <span className="text-xs font-sans text-muted-foreground leading-tight">
                    Academic reading & exercise sharing platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="flex items-center space-x-6">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/readnex"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/readnex')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Library className="h-4 w-4" />
                  ReadNEx
                </Link>
                <Link
                  to="/create"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/create')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Link>
                <Link
                  to="/noteshare"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/noteshare')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  NoteShare
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/about')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Info className="h-4 w-4" />
                  About
                </Link>
              </div>
            </div>

            {/* Right Side - Auth Actions */}
            <div className="flex items-center justify-end flex-1">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button - Always visible */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {isAuthenticated ? (
                  <>
                    {/* User Menu - Desktop */}
                    <div className="hidden md:block">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                              <AvatarFallback>
                                {user?.first_name?.[0]}{user?.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="hidden sm:inline-block max-w-[120px] truncate">
                              {user?.first_name}
                            </span>
                            {isAdmin && (
                              <Badge variant="secondary" className="ml-1 text-xs">
                                Admin
                              </Badge>
                            )}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {user?.first_name} {user?.last_name}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate('/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate('/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-4">
                    <Button 
                      variant="ghost" 
                      className="text-foreground hover:text-primary" 
                      asChild
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium px-4 shadow-md hover:shadow-lg transition-all duration-300 rounded-lg" 
                      asChild
                    >
                      <Link to="/register">
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2">
              <div className="flex flex-col space-y-3">
                {/* Public Navigation Links */}
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                <Link
                  to="/readnex"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/readnex')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Library className="h-4 w-4" />
                  ReadNEx
                </Link>
                <Link
                  to="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/create')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Link>
                <Link
                  to="/noteshare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/noteshare')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  NoteShare
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActivePath('/about')
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Info className="h-4 w-4" />
                  About
                </Link>

                {isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    {/* Authenticated User Links */}
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                            isActivePath(item.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="h-px bg-border my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                )}
                
                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <div className="flex flex-col space-y-3 px-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-center"
                        asChild
                      >
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-primary to-secondary text-primary-foreground w-full justify-center"
                        asChild
                      >
                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Contact Information */}
      {!isAuthenticated && (
        <footer className="border-t bg-muted/50 py-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Company Info */}
              <div>
                <h3 className="font-sans text-lg font-bold text-foreground mb-4">Knowly</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Knowledge Sharing Platform for Academic Reading and Exercises
                </p>
                <p className="text-sm text-muted-foreground">
                  © 2025 Knowly. Built with ❤️ for learners.
                </p>
              </div>
              
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📧 Email: support@knowly.com</p>
                  <p>📞 Phone: +84 (028) 1234-5678</p>
                  <p>📍 Address: 123 Knowledge Street, Learning City</p>
                  <p>🕒 Hours: Mon-Fri 9AM-6PM (GMT+7)</p>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                  <Link to="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                  <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                    Contact Form
                  </Link>
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