/**
 * AI API Mock Handlers
 * 
 * Handles AI-related endpoints including:
 * - Book recommendations
 * - Chatbot interactions
 * - Multi-turn conversations
 */

import { http, HttpResponse, delay } from 'msw'
import { mockBooks } from '../data/mockBooks'

/**
 * Generate mock AI recommendations based on query
 */
function generateRecommendations(query: string, count: number = 5) {
  const lowerQuery = query.toLowerCase()
  
  // Simple keyword matching for realistic results
  let filteredBooks = mockBooks.filter(book => {
    const searchText = `${book.title} ${book.author} ${book.subject} ${book.description}`.toLowerCase()
    return searchText.includes(lowerQuery)
  })
  
  // If no matches, return top-rated books
  if (filteredBooks.length === 0) {
    filteredBooks = [...mockBooks].sort((a, b) => b.rating - a.rating)
  }
  
  // Return top N books
  return filteredBooks.slice(0, count)
}

/**
 * Generate mock chatbot response based on message
 */
function generateChatResponse(message: string, role: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Pattern-based responses for common queries
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return `As a ${role}, I'd be happy to recommend some great books! Based on your interests, I suggest exploring classics like "1984" by George Orwell or "The Great Gatsby" by F. Scott Fitzgerald. What genre interests you most?`
  }
  
  if (lowerMessage.includes('fantasy')) {
    return `Fantasy is an amazing genre! I highly recommend "The Lord of the Rings" by J.R.R. Tolkien - it's an epic adventure with rich world-building. "Harry Potter" by J.K. Rowling is another excellent choice that combines magic with coming-of-age themes.`
  }
  
  if (lowerMessage.includes('sci-fi') || lowerMessage.includes('science fiction')) {
    return `Science fiction offers fascinating explorations of technology and society. I recommend "Dune" by Frank Herbert for epic space opera, or "1984" by George Orwell for dystopian social commentary. Both are thought-provoking masterpieces!`
  }
  
  if (lowerMessage.includes('classic')) {
    return `Classic literature is timeless! "To Kill a Mockingbird" by Harper Lee is a powerful exploration of justice and morality. "Pride and Prejudice" by Jane Austen offers wit and social insight. Both are essential reads.`
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `Hello! I'm your ${role}, here to help you discover amazing books. Feel free to ask about any genre, author, or specific reading interests you have!`
  }
  
  if (lowerMessage.includes('help')) {
    return `I can help you with book recommendations, discuss themes and authors, explain literary concepts, and guide your reading journey. What would you like to know about?`
  }
  
  // Default response
  return `That's an interesting question! As a ${role}, I'm here to help you explore the world of books. Could you tell me more about what you're looking for? Are you interested in a specific genre, author, or theme?`
}

/**
 * POST /api/recommend_books/ - Get AI book recommendations
 * Authentication optional
 */
const recommendBooks = http.post('/api/recommend_books/', async ({ request }) => {
  await delay(400) // AI responses take a bit longer
  
  try {
    const body = await request.json() as { query: string }
    
    if (!body.query || body.query.trim() === '') {
      return HttpResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }
    
    const recommendations = generateRecommendations(body.query, 5)
    
    console.log(`[MSW] AI recommendations for query: "${body.query}" (${recommendations.length} results)`)
    
    return HttpResponse.json({
      recommendations,
      query: body.query,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/chatbot/ - Simple chatbot interaction
 * Authentication optional
 */
const chatbot = http.post('/api/chatbot/', async ({ request }) => {
  await delay(500) // Simulate AI thinking time
  
  try {
    const body = await request.json() as {
      message: string
      role?: string
    }
    
    if (!body.message || body.message.trim() === '') {
      return HttpResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const role = body.role || 'book advisor'
    const response = generateChatResponse(body.message, role)
    
    // Optionally include book recommendations if query seems to request them
    let recommendations = undefined
    if (body.message.toLowerCase().includes('recommend') || 
        body.message.toLowerCase().includes('suggest')) {
      recommendations = generateRecommendations(body.message, 3)
    }
    
    console.log(`[MSW] Chatbot response to: "${body.message}"`)
    
    return HttpResponse.json({
      response,
      recommendations,
      role,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Sorry, I could not respond at the moment.' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/chatbot/conversation/ - Chatbot with conversation context
 * Authentication optional
 */
const chatbotConversation = http.post('/api/chatbot/conversation/', async ({ request }) => {
  await delay(500)
  
  try {
    const body = await request.json() as {
      message: string
      role?: string
      context?: Array<{ role: string; content: string }>
    }
    
    if (!body.message || body.message.trim() === '') {
      return HttpResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const role = body.role || 'book advisor'
    const context = body.context || []
    
    // Generate response considering context
    let response = generateChatResponse(body.message, role)
    
    // If context suggests ongoing conversation, adjust response
    if (context.length > 0) {
      const lastMessage = context[context.length - 1]
      if (lastMessage.role === 'assistant') {
        // Continue the conversation naturally
        response = `Continuing from our discussion, ${response.charAt(0).toLowerCase() + response.slice(1)}`
      }
    }
    
    // Check for recommendations
    let recommendations = undefined
    const messageWithContext = `${body.message} ${context.map(c => c.content).join(' ')}`.toLowerCase()
    if (messageWithContext.includes('recommend') || messageWithContext.includes('suggest')) {
      recommendations = generateRecommendations(body.message, 3)
    }
    
    console.log(`[MSW] Conversational chatbot response (context: ${context.length} messages)`)
    
    return HttpResponse.json({
      response,
      recommendations,
      role,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Sorry, I could not respond at the moment.' },
      { status: 500 }
    )
  }
})

/**
 * POST /api/chatbot/multi-turn/ - Multi-turn conversation with conversation ID
 * Authentication optional
 */
const chatbotMultiTurn = http.post('/api/chatbot/multi-turn/', async ({ request }) => {
  await delay(500)
  
  try {
    const body = await request.json() as {
      message: string
      conversation_id?: string
      role?: string
      history?: Array<{ user: string; ai: string }>
    }
    
    if (!body.message || body.message.trim() === '') {
      return HttpResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }
    
    const role = body.role || 'book advisor'
    const history = body.history || []
    
    // Generate or use existing conversation ID
    const conversationId = body.conversation_id || `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Generate response considering full history
    let response = generateChatResponse(body.message, role)
    
    // Adjust response based on conversation history
    if (history.length > 0) {
      // Make response more contextual
      if (history.length === 1) {
        response = `Thanks for continuing our chat! ${response}`
      } else if (history.length >= 3) {
        response = `I'm enjoying our discussion about books. ${response}`
      }
    }
    
    // Check for recommendations based on entire conversation
    let recommendations = undefined
    const fullContext = `${body.message} ${history.map(h => h.user).join(' ')}`.toLowerCase()
    if (fullContext.includes('recommend') || fullContext.includes('suggest')) {
      recommendations = generateRecommendations(body.message, 3)
    }
    
    console.log(`[MSW] Multi-turn chat response (conversation: ${conversationId}, turns: ${history.length})`)
    
    return HttpResponse.json({
      response,
      recommendations,
      conversation_id: conversationId,
      role,
    })
  } catch (error) {
    return HttpResponse.json(
      { error: 'Sorry, I could not respond at the moment.' },
      { status: 500 }
    )
  }
})

/**
 * Export all AI handlers
 */
export const aiHandlers = [
  recommendBooks,
  chatbot,
  chatbotConversation,
  chatbotMultiTurn,
]
