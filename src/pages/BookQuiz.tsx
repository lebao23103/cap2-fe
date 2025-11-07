import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Target, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  ChevronRight,
  // Star,
  Play
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface QuizData {
  bookId: string
  bookTitle: string
  bookAuthor: string
  questions: QuizQuestion[]
  timeLimit: number // in minutes
  passingScore: number // percentage
}

// Mock quiz data
const mockQuizData: QuizData = {
  bookId: "1",
  bookTitle: "The Midnight Library",
  bookAuthor: "Matt Haig",
  timeLimit: 30,
  passingScore: 70,
  questions: [
    {
      id: "1",
      type: "multiple-choice",
      question: "What is the main setting of 'The Midnight Library'?",
      options: [
        "A regular public library",
        "A magical library between life and death",
        "A university library",
        "An online digital library"
      ],
      correctAnswer: 1,
      explanation: "The Midnight Library exists between life and death, where each book represents a different life path that Nora could have taken.",
      difficulty: "easy"
    },
    {
      id: "2",
      type: "multiple-choice",
      question: "Who is the main protagonist of the story?",
      options: [
        "Matt Haig",
        "Mrs. Elm",
        "Nora Seed",
        "Joe"
      ],
      correctAnswer: 2,
      explanation: "Nora Seed is the main character who finds herself in the Midnight Library and explores different versions of her life.",
      difficulty: "easy"
    },
    {
      id: "3",
      type: "true-false",
      question: "Each book in the Midnight Library represents a different career path only.",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False. Each book represents a different life path, which includes not just careers but all the different choices and directions Nora's life could have taken.",
      difficulty: "medium"
    },
    {
      id: "4",
      type: "multiple-choice",
      question: "What is the central theme of 'The Midnight Library'?",
      options: [
        "Time travel and science fiction",
        "Romance and relationships",
        "Regret, choices, and the meaning of life",
        "Adventure and exploration"
      ],
      correctAnswer: 2,
      explanation: "The book explores themes of regret, the impact of our choices, and finding meaning and purpose in the life we choose to live.",
      difficulty: "medium"
    },
    {
      id: "5",
      type: "multiple-choice",
      question: "What does Nora learn by the end of her journey through the library?",
      options: [
        "That she should have made different choices",
        "That no life is perfect, but every life has value",
        "That she wants to live someone else's life",
        "That books are better than real life"
      ],
      correctAnswer: 1,
      explanation: "Nora learns that happiness isn't about living the perfect life, but about finding meaning and connection in the life you choose to live.",
      difficulty: "hard"
    },
    {
      id: "6",
      type: "true-false",
      question: "The library is managed by Mrs. Elm, Nora's former school librarian.",
      options: ["True", "False"],
      correctAnswer: 0,
      explanation: "True. Mrs. Elm, who was Nora's school librarian and later becomes the librarian of the Midnight Library, guides Nora through her journey.",
      difficulty: "medium"
    },
    {
      id: "7",
      type: "multiple-choice",
      question: "What philosophical concept does the book primarily explore?",
      options: [
        "The multiverse and parallel lives",
        "The nature of time",
        "The power of friendship",
        "The importance of education"
      ],
      correctAnswer: 0,
      explanation: "The book explores the concept of the multiverse - the idea that there are infinite versions of our lives based on different choices we could have made.",
      difficulty: "hard"
    },
    {
      id: "8",
      type: "true-false",
      question: "The book suggests that there is only one 'correct' way to live life.",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "False. The book suggests that there are many different ways to live a meaningful life, and that happiness comes from accepting and making the most of the life you choose.",
      difficulty: "medium"
    }
  ]
}

export default function BookQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quizData] = useState<QuizData>(mockQuizData)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | string)[]>([])
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(quizData.timeLimit * 60) // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState<{[key: string]: boolean}>({})

  // Timer effect
  useEffect(() => {
    if (quizStarted && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setShowResults(true)
            calculateScore()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [quizStarted, showResults, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setSelectedAnswers(new Array(quizData.questions.length).fill(null))
  }

  const handleAnswerSelect = (answerIndex: number | string) => {
    // Only allow answer selection if not already answered
    if (selectedAnswers[currentQuestion] === null) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestion] = answerIndex
      setSelectedAnswers(newAnswers)
      
      // Show explanation immediately after selecting an answer
      setShowExplanation(prev => ({
        ...prev,
        [currentQuestion]: true
      }))
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      // Keep explanation visible if answer was already selected
      if (selectedAnswers[currentQuestion + 1] !== null) {
        setShowExplanation(prev => ({
          ...prev,
          [currentQuestion + 1]: true
        }))
      }
    } else {
      finishQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
      // Keep explanation visible if answer was already selected
      if (selectedAnswers[currentQuestion - 1] !== null) {
        setShowExplanation(prev => ({
          ...prev,
          [currentQuestion - 1]: true
        }))
      }
    }
  }

  const calculateScore = () => {
    let correct = 0
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    setScore(Math.round((correct / quizData.questions.length) * 100))
    return correct
  }

  const finishQuiz = () => {
    calculateScore()
    setShowResults(true)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(quizData.questions.length).fill(null))
    setShowResults(false)
    setTimeLeft(quizData.timeLimit * 60)
    setQuizStarted(false)
    setScore(0)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= quizData.passingScore) return 'text-blue-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent!', color: 'bg-green-600' }
    if (score >= quizData.passingScore) return { text: 'Passed', color: 'bg-blue-600' }
    return { text: 'Try Again', color: 'bg-red-600' }
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-ink-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/readnex')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
                    <Target className="h-12 w-12 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">
                  Comprehension Quiz
                </CardTitle>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {quizData.bookTitle}
                </p>
                <p className="text-lg text-gray-500">
                  by {quizData.bookAuthor}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {quizData.questions.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Questions
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {quizData.timeLimit}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Minutes
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {quizData.passingScore}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      To Pass
                    </div>
                  </div>
                </div>
                
                <div className="text-left bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Quiz Instructions:</h3>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Read each question carefully</li>
                    <li>• You can navigate between questions</li>
                    <li>• Timer starts when you begin</li>
                    <li>• You need {quizData.passingScore}% to pass</li>
                    <li>• Review your answers before submitting</li>
                  </ul>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={startQuiz}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const scoreBadge = getScoreBadge(score)
    const correctAnswers = quizData.questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length
    
    return (
      <div className="min-h-screen bg-parchment-50 dark:bg-ink-950 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`${scoreBadge.color} p-4 rounded-full`}>
                    <Award className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold">
                  Quiz Complete!
                </CardTitle>
                <Badge className={`${scoreBadge.color} text-white text-lg px-4 py-2`}>
                  {scoreBadge.text}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {correctAnswers} out of {quizData.questions.length} correct
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.floor((quizData.timeLimit * 60 - timeLeft) / 60)}:{((quizData.timeLimit * 60 - timeLeft) % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Time Taken
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {score >= quizData.passingScore ? 'Passed' : 'Failed'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Status
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/book/${id}/read`)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Continue Reading
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={restartQuiz}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Quiz
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate('/readnex')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Library
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const question = quizData.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100

  return (
    <div className="min-h-screen bg-parchment-50 dark:bg-ink-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/readnex')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {quizData.questions.length}
            </Badge>
          </div>
        </div>
        
        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={
                  question.difficulty === 'easy' ? 'bg-green-600' :
                  question.difficulty === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                }>
                  {question.difficulty}
                </Badge>
                <Badge variant="outline">
                  {question.type.replace('-', ' ')}
                </Badge>
              </div>
              <CardTitle className="text-xl">
                {question.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {question.options && (
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <Button
                        variant={
                          selectedAnswers[currentQuestion] === index 
                            ? "default" 
                            : selectedAnswers[currentQuestion] !== null
                              ? "secondary"
                              : "outline"
                        }
                        className="w-full text-left justify-start h-auto p-4"
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswers[currentQuestion] !== null}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswers[currentQuestion] === index 
                              ? 'bg-primary border-primary text-primary-foreground' 
                              : selectedAnswers[currentQuestion] !== null
                                ? 'bg-gray-200 border-gray-300'
                                : 'border-gray-300'
                          }`}>
                            {selectedAnswers[currentQuestion] === index && (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            {selectedAnswers[currentQuestion] !== null && index === question.correctAnswer && selectedAnswers[currentQuestion] !== index && (
                              <span className="text-xs font-bold">✓</span>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </Button>
                      
                      {/* Explanation for selected answer */}
                      {showExplanation[currentQuestion] && selectedAnswers[currentQuestion] === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`p-3 rounded-lg text-sm ${
                            index === question.correctAnswer 
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                              : 'bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {index === question.correctAnswer ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-medium mb-1">
                                {index === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {question.explanation}
                              </p>
                              {index !== question.correctAnswer && (
                                <p className="text-sm text-green-700 dark:text-green-300 mt-2 font-medium">
                                  Correct answer: {question.options?.[Number(question.correctAnswer)]}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                This concept is explored throughout the book, particularly in chapters discussing life choices and regret.
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                  
                  {/* Show correct answer if question is answered but explanation is not shown */}
                  {selectedAnswers[currentQuestion] !== null && !showExplanation[currentQuestion] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start text-blue-600 dark:text-blue-400"
                      onClick={() => setShowExplanation(prev => ({
                        ...prev,
                        [currentQuestion]: true
                      }))}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Show explanation and correct answer
                    </Button>
                  )}
                </div>
              )}
              
              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                <div className="text-sm text-gray-500">
                  {selectedAnswers.filter(a => a !== null).length} of {quizData.questions.length} answered
                </div>
                
                {currentQuestion === quizData.questions.length - 1 ? (
                  <Button 
                    onClick={finishQuiz}
                    disabled={selectedAnswers[currentQuestion] === null}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Finish Quiz
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    disabled={selectedAnswers[currentQuestion] === null}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}



