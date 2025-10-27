/**
 * File validation utilities for upload handling
 */

export interface FileValidationResult {
  valid: boolean
  error?: string
}

// File type configurations
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const ALLOWED_BOOK_TYPES = [
  'application/pdf',
  'application/epub+zip',
  'application/x-epub+zip',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
]

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_BOOK_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * Validate image file for book cover upload
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file is too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB.`
    }
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Please upload a JPG, PNG, or WebP file.'
    }
  }

  return { valid: true }
}

/**
 * Validate book file upload
 */
export function validateBookFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > MAX_BOOK_SIZE) {
    return {
      valid: false,
      error: `Book file is too large. Maximum size is ${MAX_BOOK_SIZE / (1024 * 1024)}MB.`
    }
  }

  // Check file type by MIME type
  const isValidMimeType = ALLOWED_BOOK_TYPES.includes(file.type)
  
  // Also check by file extension as fallback (some browsers don't set MIME types correctly)
  const fileName = file.name.toLowerCase()
  const hasValidExtension = fileName.endsWith('.pdf') || 
                           fileName.endsWith('.epub') || 
                           fileName.endsWith('.txt') ||
                           fileName.endsWith('.docx')

  if (!isValidMimeType && !hasValidExtension) {
    return {
      valid: false,
      error: 'Invalid book format. Please upload a PDF, EPUB, TXT, or DOCX file.'
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
