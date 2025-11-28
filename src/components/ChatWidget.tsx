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
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 blur-lg group-hover:blur-xl transition-all duration-300 animate-pulse" />

            <Button
              onClick={handleOpen}
              className="relative h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-xl transition-all duration-300 hover:scale-110 border-0"
              size="icon"
            >
              <MessageCircle className="h-6 w-6 text-white" strokeWidth={2} />
            </Button>

            {/* Notification dot */}
            <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-2 border-background shadow-md animate-bounce">
              <span className="text-[10px] font-bold text-white">1</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {(isOpen || isClosing) && (
        <div className="fixed bottom-6 right-6 z-50">
          <Card className={`w-[340px] shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-border/40 overflow-hidden rounded-2xl origin-bottom-right transition-all duration-200 ease-out ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            } ${isMinimized ? 'h-14' : 'h-[460px]'
            }`}>
            {/* Improved Header */}
            <CardHeader className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white relative overflow-hidden">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent)]" />

              <div className="relative flex items-center justify-between gap-2">
                {/* Left: Icon + Title */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <div className="h-7 w-7 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Title + Status */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-[13px] font-semibold tracking-tight truncate">Knowly Assistant</CardTitle>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-300" />
                        <span className="text-[9px] text-white/85 font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 text-white/85 hover:text-white hover:bg-white/15 rounded-md transition-all"
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-6 w-6 text-white/85 hover:text-white hover:bg-white/15 rounded-md transition-all"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Compact Chat Content */}
            {!isMinimized && (
              <CardContent className="p-0 flex flex-col h-[400px] bg-gradient-to-br from-white/60 via-white/40 to-transparent dark:from-slate-900/60 dark:via-slate-900/40 dark:to-transparent">
                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4 py-3">
                  <div className="space-y-2.5">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                      >
                        <div className="flex items-start gap-2 max-w-[85%]">
                          {message.type === 'bot' && (
                            <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                              <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm ${message.type === 'user'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white ml-auto'
                              : 'bg-card/50 backdrop-blur-sm text-foreground border border-border/50'
                              }`}
                          >
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-2 max-w-[85%]">
                          <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          </div>
                          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-3 py-2 shadow-sm">
                            <div className="flex gap-1.5">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Compact Input Area */}
                <div className="px-4 py-3 border-t border-border/50 bg-card/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-background/60 backdrop-blur-sm rounded-full px-3.5 py-2 border border-border/50 shadow-sm">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about books..."
                        className="h-7 text-xs bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground/60"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                      className="bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 h-10 w-10 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send className="h-3.5 w-3.5" />
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
