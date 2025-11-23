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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { validateImageFile, validateBookFile, formatFileSize } from '@/lib/fileValidation'

// Book creation interface
interface BookData {
  title: string
  description: string
  author: string
  content: string
  coverImage: File | null
  bookFile: File | null
  tags: string[]
}


export default function Create() {
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    description: '',
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
    if (!bookData.description.trim()) {
      errors.description = 'Description is required'
    } else if (bookData.description.length < 50) {
      errors.description = 'Description must be at least 50 characters'
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
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Simulate upload process with progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      // Here you would typically send the data to your backend
      console.log('Publishing book:', bookData)
      
      toast({
        title: "Success!",
        description: "Your book has been published successfully.",
      })
      
      setIsUploading(false)
      setUploadProgress(0)
    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      toast({
        title: "Upload Failed",
        description: "There was an error publishing your book. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-12 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 rounded-full bg-primary/10 text-primary border-0 text-sm font-semibold">
            <Feather className="mr-2 h-4 w-4" />
            Create & Publish
          </Badge>
          <h1 className="font-sans text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
              Share Your Story
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1.5 bg-card/50 backdrop-blur-md border-0 shadow-xl rounded-2xl">
              <TabsTrigger value="info" className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Book Info</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Upload Files</span>
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all duration-300">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline font-semibold">Preview</span>
              </TabsTrigger>
            </TabsList>

            {/* Book Information Tab */}
            <TabsContent value="info">
              <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-br from-primary/5 via-transparent to-transparent pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10 shadow-sm">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Book Information</CardTitle>
                      <CardDescription className="mt-1.5">
                        Fill in the essential details about your book
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-foreground flex items-center gap-2">
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
                        className={`h-11 rounded-xl ${validationErrors.title ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      <div className="min-h-[20px]">
                        {validationErrors.title && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.title}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-semibold text-foreground flex items-center gap-2">
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
                        className={`h-11 rounded-xl ${validationErrors.author ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                      <div className="min-h-[20px]">
                        {validationErrors.author && (
                          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {validationErrors.author}
                          </p>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      Book Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Write a compelling description of your book (minimum 50 characters)..."
                      value={bookData.description}
                      onChange={(e) => {
                        handleInputChange('description', e.target.value)
                        setValidationErrors(prev => ({ ...prev, description: '' }))
                      }}
                      className={`min-h-[140px] rounded-xl resize-none ${validationErrors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      rows={6}
                    />
                    <div className="flex justify-between items-center min-h-[20px]">
                      {validationErrors.description ? (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {validationErrors.description}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {bookData.description.length < 50 ? `${50 - bookData.description.length} more characters needed` : 'Looks good!'}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground font-medium">
                        {bookData.description.length} / 50
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Media Upload Tab */}
            <TabsContent value="media">
              <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-br from-purple-500/5 via-transparent to-transparent pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 shadow-sm">
                      <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Upload Files</CardTitle>
                      <CardDescription className="mt-1.5">
                        Add your cover image and book file for readers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Cover Image Upload */}
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Book Cover Image
                    </Label>
                    <div className="group relative border-2 border-dashed border-border/30 hover:border-primary/40 rounded-2xl p-12 text-center transition-all duration-300 bg-gradient-to-br from-primary/5 via-transparent to-transparent hover:shadow-xl hover:scale-[1.01]">
                      {bookData.coverImage ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                              <Image className="h-12 w-12 mx-auto text-green-600 dark:text-green-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              {bookData.coverImage.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {formatFileSize(bookData.coverImage.size)}
                            </p>
                            <ModernButton
                              variant="ghost"
                              size="sm" 
                              onClick={() => handleFileUpload('coverImage', null)}
                              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                            >
                              Remove Image
                            </ModernButton>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                              <Image className="h-12 w-12 mx-auto text-primary group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-foreground mb-1">Upload book cover</p>
                            <p className="text-sm text-muted-foreground mb-4">
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
                              className="border-primary/30 hover:bg-primary/10 hover:border-primary/50"
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
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Book File (Optional)
                    </Label>
                    <div className="group relative border-2 border-dashed border-border/30 hover:border-purple-500/40 rounded-2xl p-12 text-center transition-all duration-300 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent hover:shadow-xl hover:scale-[1.01]">
                      {bookData.bookFile ? (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                              <FileText className="h-12 w-12 mx-auto text-green-600 dark:text-green-500" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              {bookData.bookFile.name}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              {formatFileSize(bookData.bookFile.size)}
                            </p>
                            <ModernButton
                              variant="ghost"
                              size="sm" 
                              onClick={() => handleFileUpload('bookFile', null)}
                              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                            >
                              Remove File
                            </ModernButton>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-purple-500/10 blur-2xl rounded-full" />
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                              <FileText className="h-12 w-12 mx-auto text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          </div>
                          <div>
                            <p className="text-base font-semibold text-foreground mb-1">Upload book file</p>
                            <p className="text-sm text-muted-foreground mb-4">
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
                              className="border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500/50"
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
              <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 shadow-sm">
                      <Eye className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Book Preview</CardTitle>
                      <CardDescription className="mt-1.5">
                        See how your book will appear to readers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-w-4xl mx-auto">
                    {/* Book Card Preview */}
                    <div className="rounded-2xl shadow-2xl overflow-hidden border-0 bg-card/50 backdrop-blur-sm hover:shadow-3xl hover:scale-[1.01] transition-all duration-300">
                      <div className="flex flex-col sm:flex-row p-8 gap-6">
                        <div className="flex-shrink-0 w-full sm:w-40 h-56 sm:h-52 bg-gradient-to-br from-muted to-muted/60 rounded-xl flex items-center justify-center shadow-xl">
                          {bookData.coverImage ? (
                            <img 
                              src={URL.createObjectURL(bookData.coverImage)} 
                              alt="Book cover" 
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <Image className="h-16 w-16 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {bookData.title || 'Book Title'}
                          </h3>
                          <p className="text-muted-foreground mb-2">
                            by {bookData.author || 'Author Name'}
                          </p>
                          <div className="flex gap-2 mb-3">
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              ✍️ User Created
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {bookData.description || 'Book description will appear here...'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {bookData.bookFile && (
                      <div className="mt-6 p-6 bg-card rounded-lg border-0 shadow-sm">
                        <h4 className="font-semibold mb-3">Uploaded Book File:</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <FileText className="h-5 w-5" />
                          <span>{bookData.bookFile.name}</span>
                          <Badge variant="outline" className="text-xs">
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
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl px-8"
                >
                  Continue to Upload Files
                </ModernButton>
                {(!bookData.title || !bookData.author || !bookData.description || bookData.description.length < 50) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
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
                onClick={() => setActiveTab('preview')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
              >
                Continue to Preview
              </ModernButton>
            ) : (
              <div className="flex flex-col gap-4 w-full max-w-md">
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
                <ModernButton 
                  variant="secondary" 
                  size="lg" 
                  icon={Save}
                  disabled={isUploading}
                  className="border-border/50 hover:bg-muted/50"
                >
                  Save Draft
                </ModernButton>
                <ModernButton
                  size="lg" 
                  icon={isUploading ? AlertCircle : Check}
                  onClick={handlePublish}
                  disabled={!bookData.title || !bookData.author || !bookData.description || isUploading}
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl"
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

