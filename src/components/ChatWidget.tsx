import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import {
  MessageCircle,
  Send,
  Bot,
  X,
  Minimize2,
  Sparkles
} from 'lucide-react'
import aiService from '../lib/api/ai'
import { useToast } from './ui/use-toast'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function ChatWidget() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! I\'m your Knowly AI assistant. I can help you find your perfect next read! What kind of books do you enjoy?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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

    try {
      // Call real AI API
      const response = await aiService.sendMessage(inputMessage)

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('Chat API Error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      })

      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 200) // Match animation duration
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && !isClosing && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative group">
            <Button
              onClick={handleOpen}
              className="relative h-12 w-12 rounded-full bg-primary text-primary-foreground border-2 border-border shadow-neo hover:translate-y-[-2px] hover:shadow-neo-hover transition-all duration-200"
              size="icon"
            >
              <MessageCircle className="h-6 w-6" strokeWidth={2.5} />
            </Button>

            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-foreground text-background border-2 border-background flex items-center justify-center shadow-sm">
              <span className="text-[10px] font-bold">1</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {(isOpen || isClosing) && (
        <div className="fixed bottom-6 right-6 z-50 font-mono">
          <Card className={`w-[360px] border-2 border-border shadow-neo bg-card rounded-xl origin-bottom-right transition-all duration-200 ease-out ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            } ${isMinimized ? 'h-16' : 'h-[500px]'
            }`}>
            {/* Header */}
            <CardHeader className="px-4 py-3 bg-primary border-b-2 border-border">
              <div className="flex items-center justify-between gap-2">
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 border-2 border-border bg-card flex items-center justify-center shadow-neo-sm">
                    <Bot className="h-5 w-5 text-foreground" strokeWidth={2.5} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-black uppercase tracking-tight truncate text-primary-foreground">Knowly AI</CardTitle>
                      <div className="flex items-center gap-1 flex-shrink-0 px-1.5 py-0.5 bg-foreground text-background text-[10px] font-bold uppercase">
                        <span>Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 text-primary-foreground hover:bg-foreground hover:text-background rounded-lg border-2 border-transparent hover:border-border transition-all"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-8 w-8 text-primary-foreground hover:bg-foreground hover:text-background rounded-lg border-2 border-transparent hover:border-border transition-all"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Chat Content */}
            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[430px] bg-card">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div className="flex items-start gap-3 max-w-[85%]">
                          {message.type === 'bot' && (
                            <div className="flex-shrink-0 h-8 w-8 border-2 border-border bg-primary flex items-center justify-center shadow-neo-sm">
                              <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                            </div>
                          )}
                          <div
                            className={`p-3 text-sm font-bold border-2 border-border shadow-neo ${message.type === 'user'
                              ? 'bg-foreground text-background ml-auto'
                              : 'bg-card text-foreground'
                              }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-[85%]">
                          <div className="flex-shrink-0 h-8 w-8 border-2 border-border bg-primary flex items-center justify-center shadow-neo-sm">
                            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
                          </div>
                          <div className="bg-card border-2 border-border p-3 shadow-neo">
                            <div className="flex gap-1.5">
                              <div className="w-2 h-2 bg-foreground animate-bounce"></div>
                              <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                              <div className="w-2 h-2 bg-foreground animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t-2 border-border bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="TYPE MESSAGE..."
                        className="h-10 text-sm font-bold bg-background border-2 border-border rounded-lg shadow-neo-sm focus-visible:ring-0 focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-none transition-all placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                      className="h-10 w-10 bg-foreground text-background border-2 border-border rounded-lg shadow-neo-sm hover:translate-y-[-2px] hover:shadow-neo hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-neo-sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
