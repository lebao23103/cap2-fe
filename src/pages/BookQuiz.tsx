import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Target,
  ArrowLeft,
  CheckCircle,
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Play,
  Loader2
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'
import quizService, { type QuizQuestion, type QuizSession } from '@/lib/api/quiz'

export default function BookQuiz() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [session, setSession] = useState<QuizSession | null>(null)

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [timeLeft, setTimeLeft] = useState(20 * 60) // Default 20 mins if not specified
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState<{ [key: number]: boolean }>({})

  // Fetch initial data (just to show start screen info if needed, or wait for start)
  // Actually, we need to "Start Quiz" to get questions.
  // So initial screen might just show generic info or previous session info (if checking history).
  // For now, let's assume "Start Quiz" button triggers the API call to start a new session.

  // Timer effect
  useEffect(() => {
    if (quizStarted && !showResults && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz()
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

  const handleStartQuiz = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await quizService.startQuiz(Number(id))
      setSession(data.session)
      setQuestions(data.questions)
      setSelectedAnswers(new Array(data.questions.length).fill(null))
      setQuizStarted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = async (optionIndex: number) => {
    // Standardize answer to 'A', 'B', 'C', 'D'
    const options = ['A', 'B', 'C', 'D'];
    const selectedChar = options[optionIndex];

    if (selectedAnswers[currentQuestionIndex] === null && session) {
      const newAnswers = [...selectedAnswers]
      newAnswers[currentQuestionIndex] = selectedChar
      setSelectedAnswers(newAnswers)

      // Submit answer to backend immediately
      try {
        const question = questions[currentQuestionIndex];
        await quizService.submitAnswer(session.id, question.id, selectedChar);

        // Show explanation immediately
        setShowExplanation(prev => ({
          ...prev,
          [currentQuestionIndex]: true
        }))
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to submit answer.",
          variant: "destructive"
        })
      }
    }
  }

  const handleFinishQuiz = async () => {
    if (!session) return;
    try {
      const updatedSession = await quizService.completeQuiz(session.id);
      setSession(updatedSession);

      // Calculate score for display (or use backend score)
      // Backend score is number of correct answers.
      const correctCount = updatedSession.score || 0;
      const total = updatedSession.total_questions || questions.length;
      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      setScore(percentage);
      setShowResults(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete quiz.",
        variant: "destructive"
      })
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      handleFinishQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const restartQuiz = () => {
    setQuizStarted(false)
    setShowResults(false)
    setSession(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowExplanation({})
    setTimeLeft(20 * 60)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-blue-600' // Assuming 70 passed
    return 'text-red-600'
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  if (isLoading && !quizStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden font-mono">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-20" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto max-w-4xl relative z-10 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate('/readnex')}
              className="border-2 border-black dark:border-white rounded-none bg-white dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] uppercase font-bold transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
              <CardHeader className="text-center border-b-4 border-black dark:border-white pb-6 bg-secondary">
                <div className="flex justify-center mb-4">
                  <div className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    <Target className="h-12 w-12 text-black dark:text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black uppercase text-black dark:text-white font-display">
                  Book Quiz
                </CardTitle>
                <p className="text-lg font-mono text-gray-600 dark:text-gray-300">
                  Test your knowledge
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-left bg-gray-100 dark:bg-zinc-800 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                  <h3 className="font-bold uppercase mb-2 text-black dark:text-white">Quiz Instructions:</h3>
                  <ul className="text-sm space-y-1 font-mono text-gray-800 dark:text-gray-300">
                    <li>• Read each question carefully</li>
                    <li>• Select the best answer for each question</li>
                    <li>• You must complete the quiz to see your score</li>
                    <li>• Good luck!</li>
                  </ul>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-primary hover:text-black dark:hover:bg-primary dark:hover:text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all uppercase font-bold"
                  onClick={handleStartQuiz}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Start Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showResults) {
    // Determine passed status (e.g., 70%)
    const isPassed = score >= 70; // Using 70 as passing score
    const correctAnswers = session?.score || 0;

    return (
      <div className="min-h-screen bg-background relative overflow-hidden font-mono">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto max-w-4xl relative z-10 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="max-w-2xl mx-auto border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
              <CardHeader className="text-center border-b-4 border-black dark:border-white pb-6 bg-secondary">
                <div className="flex justify-center mb-4">
                  <div className={`bg-white dark:bg-zinc-800 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]`}>
                    <Award className={`h-12 w-12 ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black uppercase text-black dark:text-white font-display">
                  Quiz Complete!
                </CardTitle>
                <Badge className={`mx-auto rounded-none border-2 border-black dark:border-white px-4 py-2 text-lg font-bold uppercase text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] ${isPassed ? 'bg-green-400' : 'bg-red-400'}`}>
                  {isPassed ? 'Passed' : 'Try Again'}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {correctAnswers} out of {questions.length} correct
                  </p>
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

  // Quiz Interface
  const options = [currentQuestion.choice_a, currentQuestion.choice_b, currentQuestion.choice_c, currentQuestion.choice_d];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-mono">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="max-w-4xl mx-auto px-4 relative z-10 py-8">

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
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-4 border-2 border-black dark:border-white rounded-none bg-white dark:bg-zinc-800 [&>div]:bg-primary" />
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-none bg-white dark:bg-zinc-900">
            <CardHeader className="border-b-4 border-black dark:border-white pb-4 bg-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="rounded-none border-2 border-black dark:border-white font-bold uppercase text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] bg-yellow-400">
                  Multiple Choice
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold font-mono leading-relaxed text-black dark:text-white">
                {currentQuestion.question_text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                {options.map((optionText, index) => {
                  const label = optionLabels[index];
                  const isSelected = selectedAnswers[currentQuestionIndex] === label;

                  return (
                    <div key={index} className="space-y-2">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full text-left justify-start h-auto p-4 transition-all rounded-none border-2 border-black dark:border-white font-mono font-bold ${isSelected
                          ? 'bg-primary text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] translate-x-[-2px] translate-y-[-2px]'
                          : 'bg-white dark:bg-zinc-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
                          }`}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={selectedAnswers[currentQuestionIndex] !== null}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-gray-200 border-gray-300 text-black'
                            }`}>
                            {isSelected ? <CheckCircle className="h-5 w-5" /> : <span className="font-bold">{label}</span>}
                          </div>
                          <span className="whitespace-normal break-words">{optionText}</span>
                        </div>
                      </Button>

                      {/* Explanation for selected answer */}
                      {showExplanation[currentQuestionIndex] && selectedAnswers[currentQuestionIndex] === label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`p-3 rounded-lg text-sm mt-2 ${
                            // We might not know if it is correct if we don't have correct_answer from backend. 
                            // But for now let's assume we can't easily check correctness locally unless we store the result from submitAnswer.
                            // However, we didn't store the is_correct from submitAnswer in state.
                            // Let's just use neutral or based on what we have. 
                            'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            {/* Ideally we would show X or Check here but we need to know if it was correct. */}
                            <div className="flex-1">
                              <p className="font-medium mb-1">
                                Explanation
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {currentQuestion.explanation || "No explanation available."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>

                <div className="text-sm text-gray-500">
                  {selectedAnswers.filter(a => a !== null).length} of {questions.length} answered
                </div>

                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleFinishQuiz}
                    disabled={selectedAnswers[currentQuestionIndex] === null}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Finish Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={selectedAnswers[currentQuestionIndex] === null}
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
