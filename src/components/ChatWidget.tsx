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
  Minimize2
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
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

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(),
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botResponse])
      setIsLoading(false)
    }, 1000)
  }

  const generateBotResponse = (): string => {
    const responses = [
      "That sounds interesting! Based on your preferences, I'd recommend checking out some contemporary fiction. What specific themes do you enjoy?",
      "Great choice! I can suggest some amazing books in that genre. Are you looking for something recent or are you open to classics too?",
      "I love helping readers discover new books! Could you tell me about the last book you really enjoyed?",
      "Excellent! I have some perfect recommendations for you. Would you like me to suggest books similar to something you've already read?",
      "That's a fantastic genre! I can recommend some page-turners. Are you in the mood for something light or more thought-provoking?"
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all duration-300 hover:scale-110 border-2 border-emerald-400"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-pink-500 rounded-full flex items-center justify-center border border-white">
          <span className="text-xs font-bold text-white">1</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-300 shadow-xl bg-cyan-50 dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-600 ${
        isMinimized ? 'h-14' : 'h-96'
      }`}>
        {/* Header */}
        <CardHeader className="p-3 bg-emerald-600 dark:bg-emerald-700 text-white rounded-t-lg border-b border-emerald-500 dark:border-emerald-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold">Knowly Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 text-white hover:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 text-white hover:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Chat Content */}
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-80 bg-cyan-25 dark:bg-slate-800">
            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      message.type === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-cyan-200 dark:border-slate-600'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-white dark:bg-slate-700 border border-cyan-200 dark:border-slate-600 rounded-lg p-2 text-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-cyan-50 dark:bg-slate-900 border-cyan-200 dark:border-slate-700">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about books..."
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="icon"
                  className="bg-emerald-600 hover:bg-emerald-700 h-9 w-9"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}