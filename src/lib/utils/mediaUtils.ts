import { API_BASE_URL } from '@/lib/api/config'

/**
 * Construct full URL for media files (images, PDFs) from backend
 * @param relativePath - Relative path from backend (e.g., "/media/cover_image/...")
 * @returns Full URL if relative path, or original URL if already absolute
 */
export function getMediaUrl(relativePath: string | null | undefined): string {
    // Return placeholder if no path provided
    if (!relativePath) {
        return 'https://via.placeholder.com/300x400?text=No+Cover'
    }

    // If already absolute URL (starts with http:// or https://), return as-is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath
    }

    // Otherwise, prepend API_BASE_URL
    // Ensure no double slashes by removing leading slash from relativePath if API_BASE_URL already has one
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
    return `${API_BASE_URL}${cleanPath}`
}

/**
 * Construct full URL for book cover images
 * @param coverImage - Cover image path from backend
 * @returns Full URL or placeholder
 */
export function getCoverImageUrl(coverImage: string | null | undefined): string {
    return getMediaUrl(coverImage)
}

/**
 * Construct full URL for PDF files
 * @param pdfPath - PDF file path from backend
 * @returns Full URL or empty string
 */
export function getPdfUrl(pdfPath: string | null | undefined): string {
    if (!pdfPath) {
        return ''
    }
    return getMediaUrl(pdfPath)
}
