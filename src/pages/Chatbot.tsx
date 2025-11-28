import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { ScrollArea } from '../components/ui/scroll-area'
import { useToast } from '../components/ui/use-toast'
import aiService from '../lib/api/ai'
import {
  Send,
  User,
  Bot,
  BookOpen,
  Star,
  Sparkles,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu'

interface Message {
  id: number | string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  bookRecommendations?: Book[]
}

interface Book {
  id: string
  title: string
  author: string
  cover: string
  rating: number
  genre: string[]
}

export default function Chatbot() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: 'Hello! I\'m your Knowly AI assistant. I can help you discover amazing books, provide recommendations, and answer questions about literature. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(undefined)
  const [selectedRole, setSelectedRole] = useState<'book advisor' | 'literary expert' | 'book enthusiast'>('book advisor')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    const userInput = inputMessage
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call real AI API
      const response = await aiService.sendMessage(userInput, conversationId, selectedRole)

      // Save conversation ID for future messages
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      const botResponse: Message = {
        id: response.message_id || Date.now(),
        type: 'bot',
        content: response.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Error sending message:', error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Note: selectedRole is kept for UI display but not currently used in API calls
  // Backend chatbot determines its own personality from the conversation context

  const BookRecommendation = ({ book }: { book: Book }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <img
            src={book.cover}
            alt={book.title}
            className="w-12 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-foreground">{book.title}</h4>
            <p className="text-xs text-gray-600 dark:text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 dark:text-muted-foreground">{book.rating}</span>
            </div>
            <div className="flex gap-1 mt-1">
              {book.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-xs">
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 min-h-[400px] max-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col flex-grow">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center gap-3">
                    {/* Back Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center gap-2 text-gray-600 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-foreground flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Chat with {selectedRole === 'book advisor' ? 'Book Advisor' :
                          selectedRole === 'literary expert' ? 'Literary Expert' : 'Book Enthusiast'}
                      </CardTitle>
                      <CardDescription className="mt-1 text-gray-600 dark:text-muted-foreground">
                        Ask me anything about books, get recommendations, or discuss literature!
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mode Selector Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Mode
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Select Chat Mode</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSelectedRole('book advisor')}>
                          {selectedRole === 'book advisor' && '✓ '}Book Advisor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedRole('literary expert')}>
                          {selectedRole === 'literary expert' && '✓ '}Literary Expert
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedRole('book enthusiast')}>
                          {selectedRole === 'book enthusiast' && '✓ '}Book Enthusiast
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Mobile Sidebar Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      aria-label="Toggle sidebar"
                    >
                      {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-4 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'bot' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10">
                              <Bot className="w-4 h-4 text-primary" />
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] ${message.type === 'user' ? 'order-first' : ''}`}>
                          <div
                            className={`rounded-lg px-4 py-2 ${message.type === 'user'
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted'
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>

                          {message.bookRecommendations && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-muted-foreground font-medium">Recommended books:</p>
                              {message.bookRecommendations.map((book) => (
                                <BookRecommendation key={book.id} book={book} />
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>

                        {message.type === 'user' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10">
                            <Bot className="w-4 h-4 text-primary" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Ask ${selectedRole} something about books...`}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      disabled={isLoading}
                      maxLength={500}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      size="icon"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {inputMessage.length > 400 && (
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {inputMessage.length}/500 characters
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Collapsible on mobile */}
          <div className={`${sidebarOpen ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'} lg:block space-y-4`}>
            <div className={`${sidebarOpen ? 'fixed right-0 top-0 bottom-0 w-80 bg-background shadow-xl p-4 overflow-y-auto' : ''} lg:relative lg:w-auto lg:p-0 lg:shadow-none space-y-4`}>
              {sidebarOpen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden absolute top-2 right-2"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Recommend a mystery novel",
                    "Best books of 2024",
                    "Classic literature suggestions",
                    "Sci-fi recommendations"
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => setInputMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Capabilities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    <span>Book recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3" />
                    <span>Literary analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    <span>Contextual conversations</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
