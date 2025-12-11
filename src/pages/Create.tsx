import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import {
  Upload,
  FileText,
  Image,
  Save,
  Eye,
  Check,
  AlertCircle,
  ChevronRight,
  Feather
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ModernButton } from '@/components/ui/modern'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { validateImageFile, validateBookFile, formatFileSize } from '@/lib/fileValidation'


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

  const [activeTab, setActiveTab] = useState('info')
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
      setActiveTab('info')
      return
    }

    // Check if PDF file is uploaded (required by backend)
    if (!bookData.bookFile) {
      toast({
        title: "Missing File",
        description: "Please upload a PDF file for your book.",
        variant: "destructive"
      })
      setActiveTab('media')
      return
    }

    setIsUploading(true)
    setUploadProgress(10)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', bookData.title)
      formData.append('pdf_file', bookData.bookFile)

      if (bookData.coverImage) {
        formData.append('cover_image', bookData.coverImage)
      }

      setUploadProgress(30)

      const token = localStorage.getItem('access_token')
      if (!token) throw new Error("No access token found")

      setUploadProgress(50)

      // Send to backend
      const response = await fetch('http://127.0.0.1:8000/api/create-user-book/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      setUploadProgress(80)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to publish book')
      }

      setUploadProgress(100)

      toast({
        title: "Success!",
        description: "Your book has been submitted for admin approval.",
      })

      // Reset form after successful submission
      setBookData({
        title: '',
        author: '',
        content: '',
        coverImage: null,
        bookFile: null,
        tags: []
      })
      setActiveTab('info')

    } catch (error) {
      console.error('Publish error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error publishing your book. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-background py-12 font-mono">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-0" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="container mx-auto max-w-6xl relative z-10">

        {/* Header */}
        <motion.div {...fadeInUp} className="mb-12 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2 bg-white dark:bg-zinc-900 text-black dark:text-white border-2 border-black dark:border-white rounded-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] text-sm font-bold uppercase">
            <Feather className="mr-2 h-4 w-4" />
            Create & Publish
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight uppercase text-foreground">
            Share Your <span className="bg-primary text-black px-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">Story</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-mono">
            Transform your manuscript into a published book and share it with readers worldwide.
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-0 bg-transparent gap-4">
              <TabsTrigger
                value="info"
                className="flex items-center gap-2 py-4 px-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 font-bold uppercase text-black dark:text-gray-300"
              >

                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Book Info</span>
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="flex items-center gap-2 py-4 px-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 font-bold uppercase text-black dark:text-gray-300"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload Files</span>
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex items-center gap-2 py-4 px-4 border-2 border-black dark:border-white bg-white dark:bg-zinc-900 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all duration-300 font-bold uppercase text-black dark:text-gray-300"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card className="border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-xl">
                <CardHeader className="border-b-2 border-black dark:border-white pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 border-2 border-black dark:border-white bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <FileText className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold uppercase font-display text-black dark:text-white">Book Information</CardTitle>
                      <CardDescription className="mt-1.5 font-mono text-black dark:text-gray-300">
                        Fill in the essential details about your book
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-bold text-black dark:text-white flex items-center gap-2 uppercase">
                        Book Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder="Enter your book title..."
                        value={bookData.title}
                        onChange={(e) => {
                          handleInputChange('title', e.target.value)
                          setValidationErrors(prev => ({ ...prev, title: '' }))
                        }}
                        className={`h-12 border-2 border-black dark:border-white rounded-lg focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:bg-zinc-900 dark:text-white text-black transition-all ${validationErrors.title ? 'border-red-500' : ''}`}
                      />
                      <div className="min-h-[20px]">
                        {validationErrors.title && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-bold text-black dark:text-white flex items-center gap-2 uppercase">
                        Author <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="author"
                        type="text"
                        placeholder="Your name or pen name..."
                        value={bookData.author}
                        onChange={(e) => {
                          handleInputChange('author', e.target.value)
                          setValidationErrors(prev => ({ ...prev, author: '' }))
                        }}
                        className={`h-12 border-2 border-black dark:border-white rounded-lg focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] dark:bg-zinc-900 dark:text-white text-black transition-all ${validationErrors.author ? 'border-red-500' : ''}`}
                      />
                      <div className="min-h-[20px]">
                        {validationErrors.author && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1 font-bold">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.author}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Media Upload Tab */}
            <TabsContent value="media">
              <Card className="border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-xl">
                <CardHeader className="border-b-2 border-black dark:border-white pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 border-2 border-black dark:border-white bg-purple-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <Upload className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold uppercase font-display text-black dark:text-white">Upload Files</CardTitle>
                      <CardDescription className="mt-1.5 font-mono text-black dark:text-gray-300">
                        Add your cover image and book file for readers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8">

                  {/* Cover Image Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 uppercase text-black dark:text-white">
                      <Image className="h-4 w-4 text-black dark:text-white" />
                      Book Cover Image
                    </Label>
                    <div className="group relative border-2 border-dashed border-black dark:border-white hover:bg-gray-50 dark:hover:bg-zinc-700 p-12 text-center transition-all duration-300 rounded-xl">
                      {bookData.coverImage ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="relative p-4 bg-green-100 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                              <Image className="h-12 w-12 mx-auto text-black" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black dark:text-white mb-1 uppercase">
                              {bookData.coverImage.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">
                              {formatFileSize(bookData.coverImage.size)}
                            </p>
                            <ModernButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleFileUpload('coverImage', null)}
                              className="h-8 text-xs"
                            >
                              Remove Image
                            </ModernButton>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="relative p-4 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                              <Image className="h-12 w-12 mx-auto text-black dark:text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-bold text-black dark:text-white mb-1 uppercase">Upload book cover</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">
                              PNG or JPG • Maximum 10MB
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('coverImage', e.target.files[0])}
                              className="hidden"
                              id="cover-upload"
                            />
                            <ModernButton
                              icon={Upload}
                              variant="secondary"
                              onClick={() => document.getElementById('cover-upload')?.click()}
                            >
                              Choose File
                            </ModernButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book File Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-bold flex items-center gap-2 uppercase text-black dark:text-white">
                      <FileText className="h-4 w-4 text-black dark:text-white" />
                      Book File (Optional)
                    </Label>
                    <div className="group relative border-2 border-dashed border-black dark:border-white hover:bg-gray-50 dark:hover:bg-zinc-700 p-12 text-center transition-all duration-300 rounded-xl">
                      {bookData.bookFile ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="relative p-4 bg-green-100 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                              <FileText className="h-12 w-12 mx-auto text-black" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-black dark:text-white mb-1 uppercase">
                              {bookData.bookFile.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">
                              {formatFileSize(bookData.bookFile.size)}
                            </p>
                            <ModernButton
                              variant="danger"
                              size="sm"
                              onClick={() => handleFileUpload('bookFile', null)}
                              className="h-8 text-xs"
                            >
                              Remove File
                            </ModernButton>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="relative p-4 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
                              <FileText className="h-12 w-12 mx-auto text-black dark:text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-bold text-black dark:text-white mb-1 uppercase">Upload book file</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-mono">
                              PDF, EPUB, DOCX, or TXT • Maximum 50MB
                            </p>
                            <input
                              type="file"
                              accept=".pdf,.epub,.docx,.txt"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('bookFile', e.target.files[0])}
                              className="hidden"
                              id="book-upload"
                            />
                            <ModernButton
                              icon={Upload}
                              variant="secondary"
                              onClick={() => document.getElementById('book-upload')?.click()}
                            >
                              Choose File
                            </ModernButton>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card className="border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-xl">
                <CardHeader className="border-b-2 border-black dark:border-white pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 border-2 border-black dark:border-white bg-amber-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                      <Eye className="h-6 w-6 text-black" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold uppercase font-display text-black dark:text-white">Book Preview</CardTitle>
                      <CardDescription className="mt-1.5 font-mono text-black dark:text-gray-300">
                        See how your book will appear to readers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="max-w-4xl mx-auto">
                    {/* Book Card Preview */}
                    {/* Book Card Preview */}
                    <div className="border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-800 rounded-xl overflow-hidden">
                      <div className="flex flex-col sm:flex-row p-8 gap-6">
                        <div className="flex-shrink-0 w-full sm:w-40 h-56 sm:h-52 bg-gray-100 dark:bg-zinc-700 border-2 border-black dark:border-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                          {bookData.coverImage ? (
                            <img
                              src={URL.createObjectURL(bookData.coverImage)}
                              alt="Book cover"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-black dark:text-white mb-2 uppercase font-display">
                            {bookData.title || 'Book Title'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-2 font-mono uppercase text-sm">
                            by {bookData.author || 'Author Name'}
                          </p>
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-green-400 text-black border-2 border-black rounded-md font-bold uppercase">
                              ✍️ User Created
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 font-mono leading-relaxed">
                            No description available.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {bookData.bookFile && (
                      <div className="mt-6 p-6 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                        <h4 className="font-bold mb-3 uppercase text-sm text-black dark:text-white">Uploaded Book File:</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                          <FileText className="h-5 w-5" />
                          <span>{bookData.bookFile.name}</span>
                          <Badge variant="outline" className="text-xs border-black dark:border-white rounded-md bg-gray-100 dark:bg-zinc-700 dark:text-white">
                            {(bookData.bookFile.size / (1024 * 1024)).toFixed(2)} MB
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col items-center gap-4">
            {activeTab === 'info' ? (
              <div className="flex flex-col items-center gap-3">
                <ModernButton
                  size="lg"
                  icon={ChevronRight}
                  iconPosition="right"
                  variant="primary"
                  onClick={() => {
                    if (validateForm()) {
                      setActiveTab('media')
                    } else {
                      toast({
                        title: "Validation Error",
                        description: "Please complete all required fields correctly.",
                        variant: "destructive"
                      })
                    }
                  }}
                  className="px-8"
                >
                  Continue to Upload Files
                </ModernButton>
                {(!bookData.title || !bookData.author) && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5 font-bold uppercase">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Complete all required (*) fields to continue
                  </p>
                )}
              </div>
            ) : activeTab === 'media' ? (
              <ModernButton
                size="lg"
                icon={ChevronRight}
                iconPosition="right"
                variant="primary"
                onClick={() => setActiveTab('preview')}
              >
                Continue to Preview
              </ModernButton>
            ) : (
              <div className="flex flex-col gap-4 w-full max-w-md">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-black font-bold font-mono">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full h-4 border-2 border-black rounded-full bg-white [&>div]:bg-primary" />
                  </div>
                )}
                <ModernButton
                  variant="secondary"
                  size="lg"
                  icon={Save}
                  disabled={isUploading}
                >
                  Save Draft
                </ModernButton>
                <ModernButton
                  size="lg"
                  variant="primary"
                  icon={isUploading ? AlertCircle : Check}
                  onClick={handlePublish}
                  disabled={!bookData.title || !bookData.author || isUploading}
                >
                  {isUploading ? 'Publishing...' : 'Publish Book'}
                </ModernButton>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
