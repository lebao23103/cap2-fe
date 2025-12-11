import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
    Loader2,
    Plus,
    Trash2,
    Edit,
    Save,
    HelpCircle
} from 'lucide-react'
import adminService, { type AdminQuestion, type CreateQuestionData } from '@/lib/api/admin'

interface QuizManagerDialogProps {
    bookId: number | null
    bookTitle: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

const INITIAL_FORM_STATE: CreateQuestionData = {
    question_text: '',
    choice_a: '',
    choice_b: '',
    choice_c: '',
    choice_d: '',
    correct_answer: '',
    explanation: '',
    order_num: 1
}

export default function QuizManagerDialog({
    bookId,
    bookTitle,
    open,
    onOpenChange
}: QuizManagerDialogProps) {
    const { toast } = useToast()

    // State
    const [questions, setQuestions] = useState<AdminQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<'list' | 'form'>('list')
    const [editingId, setEditingId] = useState<number | null>(null)

    // Form State
    const [formData, setFormData] = useState<CreateQuestionData>(INITIAL_FORM_STATE)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open && bookId) {
            loadQuestions()
        } else {
            // Reset state when closed
            setView('list')
            setEditingId(null)
            setFormData(INITIAL_FORM_STATE)
        }
    }, [open, bookId])

    const loadQuestions = async () => {
        if (!bookId) return
        try {
            setLoading(true)
            const data = await adminService.getBookQuestions(bookId)
            setQuestions(data)

            // Update next order number
            const maxOrder = data.reduce((max, q) => Math.max(max, q.order_num), 0)
            setFormData(prev => ({ ...prev, order_num: maxOrder + 1 }))
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load questions",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = () => {
        setEditingId(null)
        // Calc next order
        const maxOrder = questions.reduce((max, q) => Math.max(max, q.order_num), 0)
        setFormData({ ...INITIAL_FORM_STATE, order_num: maxOrder + 1 })
        setView('form')
    }

    const handleEdit = (question: AdminQuestion) => {
        setEditingId(question.id)
        setFormData({
            question_text: question.question_text,
            choice_a: question.choice_a,
            choice_b: question.choice_b,
            choice_c: question.choice_c,
            choice_d: question.choice_d,
            correct_answer: question.correct_answer,
            explanation: question.explanation || '',
            order_num: question.order_num
        })
        setView('form')
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this question?")) return
        try {
            await adminService.deleteQuestion(id)
            toast({ title: "Success", description: "Question deleted" })
            loadQuestions()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete question", variant: "destructive" })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookId) return

        try {
            setSaving(true)
            if (editingId) {
                await adminService.updateQuestion(editingId, formData)
                toast({ title: "Updated", description: "Question updated successfully" })
            } else {
                await adminService.createQuestion(bookId, formData)
                toast({ title: "Created", description: "Question created successfully" })
            }

            // Return to list and reload
            setView('list')
            loadQuestions()
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to save question. Check if all required fields are filled.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-border rounded-xl shadow-neo-lg bg-card overflow-hidden flex flex-col p-0">

                <DialogHeader className="p-6 border-b-4 border-border bg-secondary flex-shrink-0">
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-6 w-6" />
                            <span className="font-black uppercase text-xl">Manage Quiz</span>
                        </div>
                        {view === 'list' && (
                            <Button
                                onClick={handleCreate}
                                size="sm"
                                className="font-bold border-2 border-border rounded-lg shadow-neo-sm bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-muted-foreground">
                        {bookTitle} • {questions.length} Questions
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-950/50">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-10 w-10 animate-spin text-black dark:text-white" />
                        </div>
                    ) : view === 'list' ? (
                        <div className="space-y-6">
                            {questions.length === 0 ? (
                                <div className="text-center py-16 border-4 border-dashed border-gray-300 dark:border-zinc-800 rounded-xl">
                                    <HelpCircle className="h-16 w-16 mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
                                    <p className="font-black uppercase text-xl text-gray-400 dark:text-zinc-600">No questions yet</p>
                                    <Button onClick={handleCreate} variant="link" className="text-black dark:text-white underline font-bold">
                                        Create your first question
                                    </Button>
                                </div>
                            ) : (
                                questions.sort((a, b) => a.order_num - b.order_num).map((q) => (
                                    <div key={q.id} className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white rounded-xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="font-black bg-yellow-400 text-black px-3 py-1 border-2 border-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                Question #{q.order_num}
                                            </span>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEdit(q)}
                                                    className="p-2 bg-blue-200 text-black border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-300 active:translate-y-[2px] active:shadow-none transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    className="p-2 bg-red-200 text-black border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-300 active:translate-y-[2px] active:shadow-none transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-lg mb-4 text-black dark:text-white leading-tight">{q.question_text}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm font-mono">
                                            <div className={`p-3 border-2 rounded-lg ${q.correct_answer === 'A' ? 'bg-green-100 dark:bg-green-900 border-green-600 dark:border-green-400 font-bold text-green-800 dark:text-green-100' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                                                <span className="font-black mr-2">A:</span> {q.choice_a}
                                            </div>
                                            <div className={`p-3 border-2 rounded-lg ${q.correct_answer === 'B' ? 'bg-green-100 dark:bg-green-900 border-green-600 dark:border-green-400 font-bold text-green-800 dark:text-green-100' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                                                <span className="font-black mr-2">B:</span> {q.choice_b}
                                            </div>
                                            <div className={`p-3 border-2 rounded-lg ${q.correct_answer === 'C' ? 'bg-green-100 dark:bg-green-900 border-green-600 dark:border-green-400 font-bold text-green-800 dark:text-green-100' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                                                <span className="font-black mr-2">C:</span> {q.choice_c}
                                            </div>
                                            <div className={`p-3 border-2 rounded-lg ${q.correct_answer === 'D' ? 'bg-green-100 dark:bg-green-900 border-green-600 dark:border-green-400 font-bold text-green-800 dark:text-green-100' : 'border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-gray-400'}`}>
                                                <span className="font-black mr-2">D:</span> {q.choice_d}
                                            </div>
                                        </div>
                                        {q.explanation && (
                                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-sm text-gray-700 dark:text-gray-300">
                                                <span className="font-bold block text-blue-600 dark:text-blue-400 mb-1">EXPLANATION</span>
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto bg-white dark:bg-zinc-900 p-8 border-4 border-black dark:border-white rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                            <div className="grid grid-cols-4 gap-6">
                                <div className="col-span-3 grid gap-2">
                                    <Label className="font-black uppercase text-black dark:text-white">Question Text</Label>
                                    <Textarea
                                        required
                                        value={formData.question_text}
                                        onChange={e => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                                        className="border-2 border-black dark:border-white rounded-lg bg-gray-50 dark:bg-zinc-800 text-black dark:text-white min-h-[100px] resize-none focus-visible:ring-0 focus-visible:border-primary"
                                        placeholder="Enter the question here..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="font-black uppercase text-black dark:text-white">Order #</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.order_num}
                                        onChange={e => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                                        className="border-2 border-black dark:border-white rounded-lg bg-gray-50 dark:bg-zinc-800 text-black dark:text-white h-[100px] text-center text-3xl font-black"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="font-black uppercase text-black dark:text-white text-lg border-b-2 border-black dark:border-white pb-2 block w-full">Answer Options</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'choice_a', label: 'Option A' },
                                        { key: 'choice_b', label: 'Option B' },
                                        { key: 'choice_c', label: 'Option C' },
                                        { key: 'choice_d', label: 'Option D' },
                                    ].map((opt) => (
                                        <div key={opt.key} className="relative">
                                            <Label className={`absolute top-2 left-3 text-xs font-bold uppercase ${formData.correct_answer === opt.label.split(' ')[1] ? 'text-green-600' : 'text-gray-500'}`}>
                                                {opt.label}
                                            </Label>
                                            <Input
                                                required
                                                value={formData[opt.key as keyof CreateQuestionData] as string}
                                                onChange={e => setFormData(prev => ({ ...prev, [opt.key]: e.target.value }))}
                                                className={`pt-6 pb-2 h-14 border-2 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white font-medium ${formData.correct_answer === opt.label.split(' ')[1] ? 'border-green-500 border-4 bg-green-50 dark:bg-green-900/20' : 'border-black dark:border-white'}`}
                                                placeholder={`Enter answer for ${opt.label}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2 bg-yellow-50 dark:bg-yellow-900/10 p-4 border-2 border-dashed border-yellow-400 rounded-xl">
                                <Label className="font-black uppercase text-black dark:text-white flex items-center gap-2">
                                    <span className="bg-yellow-400 text-black px-2 py-0.5 rounded text-xs border border-black">REQUIRED</span>
                                    Correct Answer
                                </Label>
                                <Select
                                    value={formData.correct_answer}
                                    onValueChange={v => setFormData(prev => ({ ...prev, correct_answer: v }))}
                                >
                                    <SelectTrigger className="border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white font-bold h-12">
                                        <SelectValue placeholder="Select correct answer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A" className="font-bold">Option A</SelectItem>
                                        <SelectItem value="B" className="font-bold">Option B</SelectItem>
                                        <SelectItem value="C" className="font-bold">Option C</SelectItem>
                                        <SelectItem value="D" className="font-bold">Option D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label className="font-black uppercase text-black dark:text-white">Explanation (Optional)</Label>
                                <Textarea
                                    value={formData.explanation}
                                    onChange={e => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                                    className="border-2 border-black dark:border-white rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-white min-h-[80px]"
                                    placeholder="Explain why the correct answer is correct..."
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t-4 border-black dark:border-white mt-8">
                                <Button
                                    type="button"
                                    onClick={() => setView('list')}
                                    className="flex-1 bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 h-12 font-bold uppercase transition-transform active:scale-95"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-green-400 text-black border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] h-12 font-black uppercase transition-all"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="h-5 w-5 mr-2" /> Save Question</>}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
