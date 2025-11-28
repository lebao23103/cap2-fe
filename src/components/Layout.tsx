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
import { ModernButton } from '@/components/ui/modern/ModernButton';
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
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl shadow-sm" role="banner">
        {/* Subtle gradient overlay - spans full width */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" aria-hidden="true" />

        {/* Content container - max-width constrained */}
        <div className="container mx-auto relative">
          <nav className="flex h-16 items-center justify-between gap-2" role="navigation" aria-label="Main navigation">
            {/* Left Side - Logo */}
            <div className="flex items-center flex-1">
              <Link to="/" className="group flex items-center space-x-2 sm:space-x-3 transition-all duration-300 hover:scale-[1.02]" aria-label="Knowly home">
                {/* Modern Logo with enhanced effects */}
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-lg group-hover:blur-xl transition-all duration-300" />
                  <div className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-sans text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-foreground dark:to-foreground/80 bg-clip-text text-transparent tracking-tight group-hover:from-primary group-hover:to-primary/70 transition-all duration-300">
                    Knowly
                  </span>
                </div>
              </Link>
            </div>

            {/* Center - Navigation Menu */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <div className="flex items-center space-x-1 bg-background/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 shadow-sm ring-1 ring-black/5 dark:ring-white/10">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActivePath('/')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  aria-current={isActivePath('/') ? 'page' : undefined}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/readnex"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActivePath('/readnex')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  aria-current={isActivePath('/readnex') ? 'page' : undefined}
                >
                  <Library className="h-4 w-4" aria-hidden="true" />
                  <span>ReadNEx</span>
                </Link>
                <Link
                  to="/create"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActivePath('/create')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  aria-current={isActivePath('/create') ? 'page' : undefined}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Create</span>
                </Link>
                <Link
                  to="/noteshare"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActivePath('/noteshare')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  aria-current={isActivePath('/noteshare') ? 'page' : undefined}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>NoteShare</span>
                </Link>
                <Link
                  to="/about"
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${isActivePath('/about')
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                  aria-current={isActivePath('/about') ? 'page' : undefined}
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  <span>About</span>
                </Link>
              </div>
            </div>

            {/* Right Side - Auth Actions */}
            <div className="flex items-center justify-end gap-2 flex-1">
              {/* Theme Toggle - Mobile & Desktop */}
              <ThemeToggle />

              {/* Mobile Menu Button - Mobile Only */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden min-h-[44px] min-w-[44px]"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {isAuthenticated ? (
                <>
                  {/* User Menu - Desktop */}
                  <div className="hidden md:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2" aria-label="User menu">
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
                        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
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
                <div className="hidden md:flex items-center gap-3">
                  <ModernButton
                    variant="ghost"
                    size="md"
                    className="!text-gray-900 dark:!text-foreground hover:text-primary font-semibold"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </ModernButton>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 border-0 shadow-lg hover:shadow-xl font-semibold transition-all duration-300"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Navigation Menu - Outside nav to prevent flex issues */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 pt-4 border-t border-border/40 bg-background">
              <div className="flex flex-col space-y-2">
                {/* Public Navigation Links */}
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  to="/readnex"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/readnex')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Library className="h-5 w-5" />
                  ReadNEx
                </Link>
                <Link
                  to="/create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/create')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Plus className="h-5 w-5" />
                  Create
                </Link>
                <Link
                  to="/noteshare"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/noteshare')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Sparkles className="h-5 w-5" />
                  NoteShare
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/about')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                    }`}
                >
                  <Info className="h-5 w-5" />
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
                          className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath(item.path)
                              ? 'bg-primary/10 text-primary'
                              : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                            }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <div className="h-px bg-border my-2" />
                    {/* Profile and Settings Links */}
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/profile')
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                        }`}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all min-h-[44px] ${isActivePath('/settings')
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent'
                        }`}
                    >
                      <Settings className="h-5 w-5" />
                      Settings
                    </Link>
                    <div className="h-px bg-border my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground hover:bg-accent rounded-lg transition-all min-h-[44px] w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      Log out
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <div className="flex flex-col space-y-2 px-3">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-center min-h-[44px]"
                        asChild
                      >
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-primary to-secondary text-primary-foreground w-full justify-center min-h-[44px]"
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Contact Information */}
      {!isAuthenticated && (
        <footer className="relative border-t border-border/40 bg-muted/30 backdrop-blur-sm py-12 md:py-16 mt-20" role="contentinfo">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent pointer-events-none" />

          <div className="container mx-auto relative">
            <div className="grid md:grid-cols-3 gap-12">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 group">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-400/20 blur-md" />
                    <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center shadow-md">
                      <BookOpen className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <h3 className="font-sans text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-foreground dark:to-foreground/70 bg-clip-text text-transparent">
                    Knowly
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground leading-relaxed">
                  Knowledge Sharing Platform for Academic Reading and Exercises
                </p>
                <div className="pt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-muted-foreground">
                  <span>© 2025 Knowly.</span>
                  <span className="text-red-500">❤️</span>
                  <span>Built for learners.</span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-foreground text-base mb-5 tracking-tight">Contact Us</h4>
                <div className="space-y-3 text-sm text-gray-600 dark:text-muted-foreground">
                  <div className="flex items-start gap-3 group hover:text-gray-900 dark:hover:text-foreground transition-colors">
                    <span className="text-base">📧</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">Email</p>
                      <p className="text-xs">support@knowly.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group hover:text-gray-900 dark:hover:text-foreground transition-colors">
                    <span className="text-base">📞</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">Phone</p>
                      <p className="text-xs">+84 (028) 1234-5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group hover:text-gray-900 dark:hover:text-foreground transition-colors">
                    <span className="text-base">📍</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">Address</p>
                      <p className="text-xs">123 Knowledge Street, Learning City</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group hover:text-gray-900 dark:hover:text-foreground transition-colors">
                    <span className="text-base">🕒</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-foreground">Hours</p>
                      <p className="text-xs">Mon-Fri 9AM-6PM (GMT+7)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-foreground text-base mb-5 tracking-tight">Quick Links</h4>
                <div className="space-y-3 text-sm">
                  <Link
                    to="/about"
                    className="group flex items-center gap-2 text-gray-600 dark:text-muted-foreground hover:text-primary transition-all duration-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-0.5 transition-transform">About Us</span>
                  </Link>
                  <Link
                    to="/faq"
                    className="group flex items-center gap-2 text-gray-600 dark:text-muted-foreground hover:text-primary transition-all duration-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-0.5 transition-transform">FAQ</span>
                  </Link>
                  <Link
                    to="/contact"
                    className="group flex items-center gap-2 text-gray-600 dark:text-muted-foreground hover:text-primary transition-all duration-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-125 transition-all" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Contact Form</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Divider */}
            <div className="mt-12 pt-8 border-t border-border/40">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 dark:text-muted-foreground">
                <p>All rights reserved. Empowering learners worldwide.</p>
                <div className="flex items-center gap-4">
                  <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-foreground transition-colors">Privacy Policy</Link>
                  <span className="text-border">•</span>
                  <Link to="/terms" className="hover:text-gray-900 dark:hover:text-foreground transition-colors">Terms of Service</Link>
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