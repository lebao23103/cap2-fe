import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Eye,
  Check,
  AlertCircle,
  Feather,

  Trash2,
  RefreshCw,

} from 'lucide-react'

import { ModernButton } from '@/components/ui/modern'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { validateImageFile, validateBookFile, formatFileSize } from '@/lib/fileValidation'
import booksService from '@/lib/api/books' // Assuming this exists


// Book creation interface
interface BookData {
  title: string
  author: string
  content: string
  coverImage: File | null
  bookFile: File | null
  tags: string[]
}


export default function Create() {
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    author: '',
    content: '',
    coverImage: null,
    bookFile: null,
    tags: []
  })

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const handleInputChange = (field: keyof BookData, value: string) => {
    setBookData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (field: 'coverImage' | 'bookFile', file: File | null) => {
    if (!file) {
      setBookData(prev => ({ ...prev, [field]: null }))
      return
    }

    // Validate file based on type
    const validation = field === 'coverImage'
      ? validateImageFile(file)
      : validateBookFile(file)

    if (!validation.valid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        variant: "destructive"
      })
      return
    }

    // File is valid, update state
    setBookData(prev => ({ ...prev, [field]: file }))
    toast({
      title: "File Uploaded",
      description: `${file.name} (${formatFileSize(file.size)}) uploaded successfully`,
    })
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!bookData.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!bookData.author.trim()) {
      errors.author = 'Author name is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePublish = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before publishing.",
        variant: "destructive"
      })

      return
    }

    if (!bookData.bookFile) {
      toast({
        title: "Missing File",
        description: "Please upload a PDF file for your book.",
        variant: "destructive"
      })

      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      const formData = new FormData()
      formData.append('title', bookData.title)
      formData.append('pdf_file', bookData.bookFile)

      if (bookData.coverImage) {
        formData.append('cover_image', bookData.coverImage)
      }

      setUploadProgress(30)
      setUploadProgress(50)

      await booksService.createUserBook(formData)

      setUploadProgress(100)

      toast({
        title: "Success! Book Published",
        description: "Your book is now pending approval.",
      })

      setBookData({
        title: '',
        author: '',
        content: '',
        coverImage: null,
        bookFile: null,
        tags: []
      })


    } catch (error) {
      console.error('Publish error:', error)
      toast({
        title: "Publishing Failed",
        description: "There was an error submitting your book. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }


  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#fafafa] dark:bg-zinc-950 overflow-hidden font-mono flex flex-col transition-colors duration-300">
      {/* Global Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header Bar */}
      <div className="relative z-10 w-full px-6 py-3 border-b-2 border-black dark:border-white bg-white dark:bg-zinc-900 flex items-center justify-between shadow-sm h-16 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="bg-[#B8FF29] dark:bg-[#B8FF29] border-2 border-black dark:border-white px-3 py-1 font-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2 text-black">
            <Feather className="h-4 w-4" /> Create
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tighter text-black dark:text-white">
            Publish Book
          </h1>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          {isUploading && (
            <div className="flex items-center gap-3 mr-4">
              <span className="text-xs font-bold uppercase animate-pulse border-2 border-black bg-yellow-300 px-2 py-0.5 text-black">Uploading {uploadProgress}%</span>
              <Progress value={uploadProgress} className="w-32 h-3 border-2 border-black rounded-none bg-white" />
            </div>
          )}

          <ModernButton
            size="sm"
            variant="primary"
            icon={isUploading ? AlertCircle : Check}
            onClick={handlePublish}
            disabled={!bookData.title || !bookData.author || !bookData.bookFile || isUploading}
            className="h-9 px-6 text-xs font-black uppercase border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all bg-[#B8FF29] hover:bg-[#a3e624] text-black"
          >
            {isUploading ? 'Publishing...' : 'Publish Now'}
          </ModernButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto p-6 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

        {/* LEFT PANEL: Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 h-full flex flex-col gap-6 overflow-y-auto pr-2 pb-10"
        >
          {/* Metadata Card */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] p-0">
            <div className="border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-black dark:bg-white text-white dark:text-black p-1">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="font-black text-sm uppercase text-black dark:text-white">Book Details</span>
              </div>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-sm">* Required</span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Book Title</Label>
                <Input
                  placeholder="ENTER TITLE..."
                  value={bookData.title}
                  onChange={(e) => {
                    handleInputChange('title', e.target.value)
                    setValidationErrors(prev => ({ ...prev, title: '' }))
                  }}
                  className={`h-12 border-2 border-black dark:border-white rounded-none text-lg font-bold placeholder:text-gray-300 dark:placeholder:text-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-yellow-50 dark:focus:bg-zinc-800 transition-colors ${validationErrors.title ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">Author Name</Label>
                <Input
                  placeholder="ENTER AUTHOR..."
                  value={bookData.author}
                  onChange={(e) => {
                    handleInputChange('author', e.target.value)
                    setValidationErrors(prev => ({ ...prev, author: '' }))
                  }}
                  className={`h-12 border-2 border-black dark:border-white rounded-none text-lg font-bold placeholder:text-gray-300 dark:placeholder:text-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-white focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-yellow-50 dark:focus:bg-zinc-800 transition-colors ${validationErrors.author ? 'border-red-500 bg-red-50' : ''}`}
                />
              </div>
            </div>
          </div>

          {/* ASSETS SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">

            {/* Cover Upload Card */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col h-full group">
              <div className="border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 px-4 py-2 flex items-center justify-between">
                <span className="font-black text-xs uppercase flex items-center gap-2 text-black dark:text-white">
                  <ImageIcon className="h-3.5 w-3.5" /> Cover Image
                </span>
                {bookData.coverImage && <span className="text-[10px] font-bold bg-green-400 text-black border border-black px-1.5 shadow-sm">SELECTED</span>}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div
                  className={`flex-1 relative border-2 ${bookData.coverImage ? 'border-solid border-black dark:border-white bg-zinc-50 dark:bg-zinc-800' : 'border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white'} transition-all cursor-pointer min-h-[220px] flex flex-col items-center justify-center overflow-hidden`}
                  onClick={() => document.getElementById('simple-cover-upload')?.click()}
                >
                  <input type="file" accept="image/*" className="hidden" id="simple-cover-upload" onChange={(e) => e.target.files?.[0] && handleFileUpload('coverImage', e.target.files[0])} />

                  <AnimatePresence mode='wait'>
                    {bookData.coverImage ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full p-4 flex flex-col items-center justify-center"
                      >
                        {/* Background blur effect */}
                        <img src={URL.createObjectURL(bookData.coverImage)} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm" alt="Bg" />

                        {/* Main Image */}
                        <img src={URL.createObjectURL(bookData.coverImage)} className="relative h-48 w-auto shadow-xl border-2 border-white dark:border-zinc-500 rotate-2 group-hover:rotate-0 transition-transform duration-300 z-10 rounded-sm object-cover" alt="Preview" />

                        {/* File Info Overlay */}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur text-white px-2 py-1 text-[10px] font-mono rounded-sm z-20">
                          {formatFileSize(bookData.coverImage.size)}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-2 z-20">
                          <button
                            onClick={(e) => { e.stopPropagation(); document.getElementById('simple-cover-upload')?.click() }}
                            className="p-1.5 bg-white border border-black hover:bg-gray-100 shadow-sm transition-colors text-black"
                            title="Replace"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleFileUpload('coverImage', null) }}
                            className="p-1.5 bg-red-500 border border-black hover:bg-red-600 shadow-sm transition-colors text-white"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center p-6"
                      >
                        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-full p-4 inline-block mb-3 group-hover:border-black dark:group-hover:border-white transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">Click to Upload Cover</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1">PNG, JPG, WEBP</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* File Upload Card */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex flex-col h-full group">
              <div className="border-b-2 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 px-4 py-2 flex items-center justify-between">
                <span className="font-black text-xs uppercase flex items-center gap-2 text-black dark:text-white">
                  <FileText className="h-3.5 w-3.5" /> Book File <span className="text-red-500">*</span>
                </span>
                {bookData.bookFile && <span className="text-[10px] font-bold bg-blue-400 text-black border border-black px-1.5 shadow-sm">READY</span>}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div
                  className={`flex-1 relative border-2 ${bookData.bookFile ? 'border-solid border-black dark:border-white bg-blue-50/50 dark:bg-blue-900/10' : 'border-dashed border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white'} transition-all cursor-pointer min-h-[220px] flex flex-col items-center justify-center overflow-hidden`}
                  onClick={() => document.getElementById('simple-book-upload')?.click()}
                >
                  <input type="file" accept=".pdf,.epub,.docx,.txt" className="hidden" id="simple-book-upload" onChange={(e) => e.target.files?.[0] && handleFileUpload('bookFile', e.target.files[0])} />

                  <AnimatePresence mode='wait'>
                    {bookData.bookFile ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full h-full flex flex-col items-center justify-center p-6"
                      >
                        <FileText className="h-16 w-16 text-black dark:text-white mb-4 drop-shadow-md" strokeWidth={1.5} />

                        <div className="text-center w-full">
                          <p className="text-sm font-black uppercase truncate max-w-[200px] mx-auto bg-white dark:bg-black border border-black dark:border-white px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] text-black dark:text-white">
                            {bookData.bookFile.name}
                          </p>
                          <span className="inline-block mt-2 text-[10px] font-mono font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">
                            {formatFileSize(bookData.bookFile.size)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); document.getElementById('simple-book-upload')?.click() }}
                            className="p-1.5 bg-white border border-black hover:bg-gray-100 shadow-sm transition-colors text-black"
                            title="Replace"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleFileUpload('bookFile', null) }}
                            className="p-1.5 bg-red-500 border border-black hover:bg-red-600 shadow-sm transition-colors text-white"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-full p-4 inline-block mb-3 group-hover:border-black dark:group-hover:border-white transition-colors">
                          <Upload className="h-8 w-8 text-gray-400 dark:text-zinc-500 group-hover:text-black dark:group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">Click to Upload PDF</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-1">PDF, EPUB, DOCX</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* RIGHT PANEL: Live Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-5 h-full hidden lg:flex flex-col pb-10"
        >
          <div className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] h-full flex flex-col overflow-hidden">
            <div className="border-b-2 border-black dark:border-white p-3 bg-yellow-300 dark:bg-yellow-500 flex items-center justify-between">
              <h2 className="font-black text-sm uppercase flex items-center gap-2 text-black">
                <Eye className="h-4 w-4" /> Live Preview
              </h2>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full border border-black bg-white" />
                <div className="w-2.5 h-2.5 rounded-full border border-black bg-white" />
              </div>
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-900 relative p-8 flex items-center justify-center overflow-hidden">
              {/* Decorative Background for Preview */}
              <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="absolute inset-0 opacity-0 dark:opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              {/* The Book Card Container */}
              <div className="w-[300px] bg-white dark:bg-zinc-950 border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)]">
                {/* Book Cover Area */}
                <div className="aspect-[2/3] w-full border-b-2 border-black dark:border-white relative bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden group">
                  {bookData.coverImage ? (
                    <img src={URL.createObjectURL(bookData.coverImage)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                  ) : (
                    <div className="text-center opacity-30 p-4">
                      <div className="border-2 border-black dark:border-white p-4 rounded-full inline-block mb-3">
                        <ImageIcon className="h-10 w-10 text-black dark:text-white" />
                      </div>
                      <p className="font-bold uppercase text-sm text-black dark:text-white">Cover Preview</p>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-4 py-2">Read Book</span>
                  </div>
                </div>

                {/* Book Info Area */}
                <div className="p-5 bg-white dark:bg-zinc-950">
                  <h3 className="font-black text-2xl uppercase leading-none mb-2 line-clamp-2 text-black dark:text-white">
                    {bookData.title || "UNTITLED"}
                  </h3>
                  <p className="font-mono text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">
                    BY {bookData.author || "UNKNOWN AUTHOR"}
                  </p>

                  <div className="mt-5 pt-4 border-t-2 border-black/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase bg-black dark:bg-white text-white dark:text-black px-2 py-1">Free Read</span>
                    {bookData.bookFile && <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black dark:border-white p-2 bg-gray-50 dark:bg-zinc-800 text-center">
              <p className="text-[10px] font-mono font-bold text-gray-400 dark:text-zinc-500 uppercase">PREVIEW MODE • 100% SCALE</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
