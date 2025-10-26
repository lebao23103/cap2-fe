import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { ScrollArea } from '../components/ui/scroll-area'
import { 
  Send, 
  User, 
  BookOpen, 
  Star,
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Knowly AI assistant. I can help you discover amazing books, provide recommendations, and answer questions about literature. What would you like to know?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'book advisor' | 'literary expert' | 'book enthusiast'>('book advisor')
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

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputMessage, selectedRole),
        timestamp: new Date(),
        bookRecommendations: generateBookRecommendations(inputMessage)
      }

      setMessages(prev => [...prev, botResponse])
      setIsLoading(false)
    }, 1500)
  }

  const generateBotResponse = (userInput: string, role: string): string => {
    const responses = {
      'book advisor': [
        "Based on your interests, I'd recommend checking out some contemporary fiction. Have you read anything by Haruki Murakami?",
        "That's a great question! For someone with your reading history, I'd suggest exploring the mystery genre. Agatha Christie is always a safe bet.",
        "I can definitely help you find your next read! What genres are you in the mood for today?"
      ],
      'literary expert': [
        "From a literary perspective, your question touches on some fascinating themes. Let me break this down for you...",
        "That's an excellent observation! This reminds me of similar themes in classical literature. Would you like me to elaborate?",
        "Your analysis shows real insight. In literary criticism, this is often discussed in the context of postmodernism."
      ],
      'book enthusiast': [
        "Oh man, I LOVE talking about books! That reminds me so much of this one series I just finished...",
        "You have to read this book I just discovered! It's absolutely amazing and I couldn't put it down.",
        "That's such a cool take! I've been thinking about that book too. Let me share some of my thoughts!"
      ]
    }

    const roleResponses = responses[role as keyof typeof responses] || responses['book advisor']
    return roleResponses[Math.floor(Math.random() * roleResponses.length)]
  }

  const generateBookRecommendations = (userInput: string): Book[] | undefined => {
    // Only generate recommendations for certain keywords
    if (userInput.toLowerCase().includes('recommend') || userInput.toLowerCase().includes('suggest')) {
      return [
        {
          id: '1',
          title: 'The Seven Husbands of Evelyn Hugo',
          author: 'Taylor Jenkins Reid',
          cover: 'https://via.placeholder.com/120x180',
          rating: 4.6,
          genre: ['Historical Fiction', 'Romance']
        },
        {
          id: '2',
          title: 'Project Hail Mary',
          author: 'Andy Weir',
          cover: 'https://via.placeholder.com/120x180',
          rating: 4.7,
          genre: ['Sci-Fi', 'Adventure']
        }
      ]
    }
    return undefined
  }

  const BookRecommendation = ({ book }: { book: Book }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-3">
        <div className="flex gap-3">
          <img 
            src={book.cover} 
            alt={book.title} 
            className="w-12 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{book.title}</h4>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{book.rating}</span>
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
      <main className="container mx-auto px-4 py-6 min-h-[400px] max-h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Chat Area */}
          <div className="lg:col-span-3 flex flex-col flex-grow">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Chat with {selectedRole === 'book advisor' ? 'Book Advisor' : 
                                selectedRole === 'literary expert' ? 'Literary Expert' : 'Book Enthusiast'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Ask me anything about books, get recommendations, or discuss literature!
                    </CardDescription>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mode:</span>
                    <select 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'book advisor' | 'literary expert' | 'book enthusiast')}
                      className="text-sm border rounded px-2 py-1 bg-background"
                      aria-label="Select chat mode"
                    >
                      <option value="book advisor">Book Advisor</option>
                      <option value="literary expert">Literary Expert</option>
                      <option value="book enthusiast">Book Enthusiast</option>
                    </select>
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
                            className={`rounded-lg px-4 py-2 ${
                              message.type === 'user' 
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
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-4">
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
      </main>
    </div>
  )
}
