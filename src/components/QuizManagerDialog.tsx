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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-4 border-black dark:border-white rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-zinc-900 overflow-hidden flex flex-col p-0">

                <DialogHeader className="p-6 border-b-4 border-black dark:border-white bg-secondary flex-shrink-0">
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HelpCircle className="h-6 w-6" />
                            <span className="font-black uppercase text-xl">Manage Quiz</span>
                        </div>
                        {view === 'list' && (
                            <Button
                                onClick={handleCreate}
                                size="sm"
                                className="font-bold border-2 border-black dark:border-white rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        )}
                    </DialogTitle>
                    <DialogDescription className="font-mono text-gray-600 dark:text-gray-300">
                        {bookTitle} • {questions.length} Questions
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-zinc-950">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : view === 'list' ? (
                        <div className="space-y-4">
                            {questions.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-black dark:border-white opacity-50">
                                    <p className="font-bold uppercase">No questions yet</p>
                                    <p className="text-sm">Click "Add Question" to start</p>
                                </div>
                            ) : (
                                questions.sort((a, b) => a.order_num - b.order_num).map((q) => (
                                    <div key={q.id} className="bg-white dark:bg-zinc-900 border-2 border-black dark:border-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold bg-primary px-2 py-0.5 border border-black dark:border-white text-xs">
                                                #{q.order_num}
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(q)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(q.id)}
                                                    className="h-8 w-8 p-0 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold mb-2">{q.question_text}</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm font-mono text-gray-600 dark:text-gray-400">
                                            <div className={q.correct_answer === 'A' ? 'text-green-600 font-bold' : ''}>A: {q.choice_a}</div>
                                            <div className={q.correct_answer === 'B' ? 'text-green-600 font-bold' : ''}>B: {q.choice_b}</div>
                                            <div className={q.correct_answer === 'C' ? 'text-green-600 font-bold' : ''}>C: {q.choice_c}</div>
                                            <div className={q.correct_answer === 'D' ? 'text-green-600 font-bold' : ''}>D: {q.choice_d}</div>
                                        </div>
                                        {q.explanation && (
                                            <div className="mt-3 pt-2 border-t border-dashed border-gray-300 text-sm">
                                                <span className="font-bold">Explanation:</span> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3 grid gap-2">
                                    <Label>Question Text</Label>
                                    <Textarea
                                        required
                                        value={formData.question_text}
                                        onChange={e => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                                        className="border-2 border-black dark:border-white rounded-none"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Order #</Label>
                                    <Input
                                        type="number"
                                        required
                                        value={formData.order_num}
                                        onChange={e => setFormData(prev => ({ ...prev, order_num: parseInt(e.target.value) || 0 }))}
                                        className="border-2 border-black dark:border-white rounded-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { key: 'choice_a', label: 'Option A' },
                                    { key: 'choice_b', label: 'Option B' },
                                    { key: 'choice_c', label: 'Option C' },
                                    { key: 'choice_d', label: 'Option D' },
                                ].map((opt) => (
                                    <div key={opt.key} className="grid gap-2">
                                        <Label className={formData.correct_answer === opt.label.split(' ')[1] ? 'text-green-600 font-bold' : ''}>
                                            {opt.label}
                                        </Label>
                                        <Input
                                            required
                                            value={formData[opt.key as keyof CreateQuestionData] as string}
                                            onChange={e => setFormData(prev => ({ ...prev, [opt.key]: e.target.value }))}
                                            className={`border-2 rounded-none ${formData.correct_answer === opt.label.split(' ')[1] ? 'border-green-500 border-4' : 'border-black dark:border-white'}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <Label>Correct Answer</Label>
                                <Select
                                    value={formData.correct_answer}
                                    onValueChange={v => setFormData(prev => ({ ...prev, correct_answer: v }))}
                                >
                                    <SelectTrigger className="border-2 border-black dark:border-white rounded-none">
                                        <SelectValue placeholder="Select correct answer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A">Option A</SelectItem>
                                        <SelectItem value="B">Option B</SelectItem>
                                        <SelectItem value="C">Option C</SelectItem>
                                        <SelectItem value="D">Option D</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Explanation (Optional)</Label>
                                <Textarea
                                    value={formData.explanation}
                                    onChange={e => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                                    className="border-2 border-black dark:border-white rounded-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setView('list')}
                                    className="flex-1 border-2 border-black dark:border-white rounded-none"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-primary text-black border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save Question</>}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
