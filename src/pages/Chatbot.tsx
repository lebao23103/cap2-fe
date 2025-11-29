import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

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
  ArrowLeft,
  MessageSquare,
  Zap
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

  const BookRecommendation = ({ book }: { book: Book }) => (
    <Card className="mb-4 cursor-pointer rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white">
      <CardContent className="p-3">
        <div className="flex gap-4">
          <div className="relative w-16 h-24 shrink-0 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm text-black uppercase truncate">{book.title}</h4>
            <p className="text-xs text-gray-600 font-bold font-mono mb-2">{book.author}</p>
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-black text-black" />
              <span className="text-xs font-bold">{book.rating}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {book.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="secondary" className="text-[10px] rounded-none border border-black bg-primary/20 text-black font-bold">
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
    <div className="min-h-screen bg-background font-mono p-4 md:p-6">
      <main className="container mx-auto max-w-7xl h-[calc(100vh-100px)] min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">

          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col h-full">
            <Card className="flex-1 flex flex-col border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none overflow-hidden bg-white dark:bg-zinc-900">
              {/* Header */}
              <CardHeader className="py-4 px-6 border-b-4 border-black bg-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/dashboard')}
                      className="h-10 w-10 border-2 border-black bg-white hover:bg-black hover:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <ArrowLeft className="h-5 w-5" strokeWidth={3} />
                    </Button>
                    <div>
                      <CardTitle className="text-xl font-black uppercase flex items-center gap-2 text-black">
                        <MessageSquare className="h-6 w-6" strokeWidth={3} />
                        AI Assistant
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-2 w-2 bg-green-500 border border-black animate-pulse" />
                        <p className="text-xs font-bold text-black/80 uppercase tracking-wider">
                          {selectedRole} Mode
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="hidden sm:flex h-10 font-bold border-2 border-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white text-black transition-all">
                          CHANGE MODE
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 border-4 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0">
                        <DropdownMenuLabel className="p-3 bg-gray-100 border-b-2 border-black font-black uppercase">Select Persona</DropdownMenuLabel>
                        <div className="p-1 bg-white">
                          <DropdownMenuItem onClick={() => setSelectedRole('book advisor')} className="font-bold uppercase focus:bg-primary focus:text-black rounded-none cursor-pointer py-2">
                            Book Advisor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedRole('literary expert')} className="font-bold uppercase focus:bg-primary focus:text-black rounded-none cursor-pointer py-2">
                            Literary Expert
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedRole('book enthusiast')} className="font-bold uppercase focus:bg-primary focus:text-black rounded-none cursor-pointer py-2">
                            Book Enthusiast
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden h-10 w-10 border-2 border-black bg-white hover:bg-black hover:text-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-0 overflow-hidden bg-dots-pattern">
                <ScrollArea className="h-full px-4 py-6 md:px-6">
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'bot' && (
                          <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
                          </div>
                        )}

                        <div className={`max-w-[85%] md:max-w-[75%] ${message.type === 'user' ? 'order-first' : ''}`}>
                          <div
                            className={`p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${message.type === 'user'
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                              }`}
                          >
                            <p className="text-sm md:text-base font-bold leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>

                          {message.bookRecommendations && (
                            <div className="mt-4 pl-4 border-l-4 border-black space-y-4">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary fill-primary" />
                                <span className="text-xs font-black uppercase bg-black text-white px-2 py-1">Top Picks</span>
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {message.bookRecommendations.map((book) => (
                                  <BookRecommendation key={book.id} book={book} />
                                ))}
                              </div>
                            </div>
                          )}

                          <p className={`text-[10px] font-black mt-2 uppercase ${message.type === 'user' ? 'text-right' : 'text-left'} opacity-50`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {message.type === 'user' && (
                          <div className="w-10 h-10 border-2 border-black bg-primary flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <User className="w-6 h-6 text-black" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
                        </div>
                        <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-black animate-bounce" />
                            <div className="w-2 h-2 bg-black animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-black animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="p-4 md:p-6 bg-white border-t-4 border-black">
                <div className="flex gap-3">
                  <Input
                    placeholder="TYPE YOUR MESSAGE HERE..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="h-14 text-lg font-bold border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="h-14 w-14 shrink-0 bg-black text-white hover:bg-primary hover:text-black border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                  >
                    <Send className="h-6 w-6" strokeWidth={3} />
                  </Button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Press Enter to send
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {inputMessage.length}/500
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={`
            fixed inset-0 z-50 lg:static lg:z-auto lg:block
            ${sidebarOpen ? 'block' : 'hidden'}
          `}>
            <div className="absolute inset-0 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-background lg:static lg:w-auto lg:h-full flex flex-col gap-6 p-4 lg:p-0 overflow-y-auto">

              {/* Quick Suggestions */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none bg-secondary">
                <CardHeader className="border-b-4 border-black py-3">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2">
                  {[
                    "Suggest a mystery thriller",
                    "Explain magic realism",
                    "Analyze The Great Gatsby",
                    "Books like 'Dune'"
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputMessage(suggestion)
                        setSidebarOpen(false)
                      }}
                      className="w-full text-left p-3 text-xs font-bold uppercase border-2 border-black bg-white hover:bg-black hover:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none bg-accent">
                <CardHeader className="border-b-4 border-black py-3">
                  <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Capabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <BookOpen className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase">Smart Recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase">Deep Literary Analysis</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase">Context Awareness</span>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Close Button */}
              <Button
                className="lg:hidden w-full border-2 border-black bg-black text-white rounded-none font-bold uppercase"
                onClick={() => setSidebarOpen(false)}
              >
                Close Menu
              </Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
