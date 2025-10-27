import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations'
import {
  Upload, 
  FileText, 
  Image, 
  Save, 
  Eye, 
  User, 
  Tag,
  Globe,
  Users,
  Check,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import { validateImageFile, validateBookFile, formatFileSize } from '@/lib/fileValidation'

// Book creation interface
interface BookData {
  title: string
  description: string
  author: string
  year: string
  genre: string
  language: string
  ageGroup: string
  content: string
  coverImage: File | null
  bookFile: File | null
  tags: string[]
}

const genres = [
  "Fiction", "Sci-Fi", "Romance", "Mystery", "Fantasy", "Thriller", 
  "Biography", "Self-Help", "Literary Fiction", "Tech Fiction", 
  "Culinary Memoir", "Member Create"
]

const languages = ["English", "Vietnamese", "Spanish", "French", "German", "Chinese", "Japanese"]
const ageGroups = ["Children", "Young Adult", "Adult", "All Ages"]

export default function Create() {
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    description: '',
    author: '',
    year: new Date().getFullYear().toString(),
    genre: 'Fiction',
    language: 'English',
    ageGroup: 'Adult',
    content: '',
    coverImage: null,
    bookFile: null,
    tags: []
  })

  const [activeTab, setActiveTab] = useState('info')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
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

  const handlePublish = async () => {
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
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div {...fadeInUp} className="mb-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-primary" />
            <h1 className="font-sans text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">Create</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Book</span>
            </h1>
            <div className="h-px w-16 bg-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Share your stories by uploading your book files and cover images
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Book Info
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Book Information Tab */}
            <TabsContent value="info">
              <Card className="bg-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Book Information
                  </CardTitle>
                  <CardDescription>
                    Fill in the basic information about your book
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Title */}
                    <div className="space-y-2">
                      <Label htmlFor="title">Book Title *</Label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Enter your book title..."
                        value={bookData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <Label htmlFor="author">Author *</Label>
                      <input
                        id="author"
                        type="text"
                        placeholder="Your name or pen name..."
                        value={bookData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>

                    {/* Genre */}
                    <div className="space-y-2">
                      <Label htmlFor="genre">Genre *</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {bookData.genre}
                            <Tag className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuLabel>Select Genre</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {genres.map((genre) => (
                            <DropdownMenuItem
                              key={genre}
                              onClick={() => handleInputChange('genre', genre)}
                            >
                              {genre}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                      <Label htmlFor="year">Publication Year *</Label>
                      <input
                        id="year"
                        type="number"
                        placeholder="2024"
                        value={bookData.year}
                        onChange={(e) => handleInputChange('year', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>

                    {/* Language */}
                    <div className="space-y-2">
                      <Label htmlFor="language">Language *</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {bookData.language}
                            <Globe className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {languages.map((language) => (
                            <DropdownMenuItem
                              key={language}
                              onClick={() => handleInputChange('language', language)}
                            >
                              {language}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Age Group */}
                    <div className="space-y-2">
                      <Label htmlFor="ageGroup">Target Age Group *</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full justify-between">
                            {bookData.ageGroup}
                            <Users className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuLabel>Select Age Group</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {ageGroups.map((ageGroup) => (
                            <DropdownMenuItem
                              key={ageGroup}
                              onClick={() => handleInputChange('ageGroup', ageGroup)}
                            >
                              {ageGroup}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Book Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Write a compelling description of your book..."
                      value={bookData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-[120px] bg-background border-input"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Media Upload Tab */}
            <TabsContent value="media">
              <Card className="bg-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Files
                  </CardTitle>
                  <CardDescription>
                    Upload your book cover image and book file (PDF, EPUB, DOCX, TXT, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Cover Image Upload */}
                  <div className="space-y-4">
                    <Label>Book Cover Image</Label>
                    <div className="border-2 border-dashed border-input rounded-lg p-8 text-center">
                      {bookData.coverImage ? (
                        <div className="space-y-4">
                          <Image className="h-16 w-16 mx-auto text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-600">
                              {bookData.coverImage.name}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleFileUpload('coverImage', null)}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Image className="h-16 w-16 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Upload book cover</p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG up to 10MB
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('coverImage', e.target.files[0])}
                              className="hidden"
                              id="cover-upload"
                            />
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => document.getElementById('cover-upload')?.click()}
                            >
                              Choose File
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Book File Upload */}
                  <div className="space-y-4">
                    <Label>Book File (Optional)</Label>
                    <div className="border-2 border-dashed border-input rounded-lg p-8 text-center">
                      {bookData.bookFile ? (
                        <div className="space-y-4">
                          <FileText className="h-16 w-16 mx-auto text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-600">
                              {bookData.bookFile.name}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleFileUpload('bookFile', null)}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Upload book file</p>
                            <p className="text-xs text-muted-foreground">
                              PDF, EPUB, DOCX up to 50MB
                            </p>
                            <input
                              type="file"
                              accept=".pdf,.epub,.docx,.txt"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload('bookFile', e.target.files[0])}
                              className="hidden"
                              id="book-upload"
                            />
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => document.getElementById('book-upload')?.click()}
                            >
                              Choose File
                            </Button>
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
              <Card className="bg-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Book Preview
                  </CardTitle>
                  <CardDescription>
                    Preview how your book will appear to readers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-2xl mx-auto">
                    {/* Book Card Preview */}
                    <div className="bg-card rounded-lg shadow-md overflow-hidden border-0">
                      <div className="flex p-6">
                        <div className="flex-shrink-0 w-32 h-40 mr-6 bg-muted rounded-md flex items-center justify-center">
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
                            <Badge variant="outline">{bookData.genre}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              ✍️ User Created
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-3">
                            {bookData.description || 'Book description will appear here...'}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {bookData.language} • {bookData.year} • {bookData.ageGroup}
                          </div>
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
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setActiveTab('media')}
                disabled={!bookData.title || !bookData.author || !bookData.description}
              >
                Continue to Upload Files
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : activeTab === 'media' ? (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setActiveTab('preview')}
              >
                Continue to Preview
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
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
                <Button variant="outline" size="lg" disabled={isUploading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  size="lg" 
                  onClick={handlePublish}
                  disabled={!bookData.title || !bookData.author || !bookData.description || isUploading}
                  className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                >
                  {isUploading ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Publish Book
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}