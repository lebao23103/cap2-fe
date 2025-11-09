/**
 * MSW Handlers Index
 * Exports all API mock handlers organized by domain
 */

import { authHandlers } from './authHandlers'
import { booksHandlers } from './booksHandlers'
import { userHandlers } from './userHandlers'
import { aiHandlers } from './aiHandlers'
import { notesHandlers } from './notesHandlers'
import { adminHandlers } from './adminHandlers'
import { statisticsHandlers } from './statisticsHandlers'

/**
 * All MSW request handlers
 * Organized by domain for maintainability
 */
export const handlers = [
  ...authHandlers,
  ...booksHandlers,
  ...userHandlers,
  ...aiHandlers,
  ...notesHandlers,
  ...adminHandlers,
  ...statisticsHandlers,
]

/**
 * Handler count by domain
 * Useful for tracking implementation progress
 */
export const handlerStats = {
  auth: authHandlers.length,
  books: booksHandlers.length,
  user: userHandlers.length,
  ai: aiHandlers.length,
  notes: notesHandlers.length,
  admin: adminHandlers.length,
  statistics: statisticsHandlers.length,
  total: handlers.length,
}

// Log handler stats in development
if (import.meta.env.DEV) {
  console.log('[MSW] Loaded handlers:', handlerStats)
}
