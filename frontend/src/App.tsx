import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Trash2, StickyNote, CheckCircle2, 
  Briefcase, Home, Lightbulb, CheckSquare, BookOpen, Plus, X, Calendar
} from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardHeader, CardTitle } from './components/ui/card'
import { Toaster, toast } from 'sonner'

interface Note {
  id: number
  title: string
  content: string
  category: string
  completed: boolean
  due_date?: string
  created_at: string
}

const API_URL = 'https://note-app.wordlyte.com/api/notes/'

const CATEGORIES = [
  { name: "Work", icon: Briefcase },
  { name: "Personal", icon: Home },
  { name: "Ideas", icon: Lightbulb },
  { name: "Tasks", icon: CheckSquare },
  { name: "Reference", icon: BookOpen },
]

function NoteCard({ note, toggleComplete, deleteNote }: { note: Note, toggleComplete: (n: Note) => void, deleteNote: (id: number) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-100, 100], [-5, 5])
  const [isSelected, setIsSelected] = useState(false)

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 80) {
      toggleComplete(note)
    } else if (info.offset.x < -80) {
      deleteNote(note.id)
    }
    x.set(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
        <div className="flex items-center gap-2 text-white font-bold bg-emerald-500 h-full w-1/2 justify-start pl-6">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2 text-white font-bold bg-red-500 h-full w-1/2 justify-end pr-6">
          <Trash2 className="h-5 w-5" />
        </div>
      </div>

      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        onClick={() => setIsSelected(!isSelected)}
        className="relative z-10 touch-pan-y cursor-pointer"
      >
        <Card className={`group relative h-full flex flex-col transition-all duration-200 border border-slate-200 shadow-sm hover:shadow-md rounded-xl
            ${note.completed ? 'bg-slate-50' : 'bg-white'}
            ${isSelected ? 'ring-2 ring-slate-900 shadow-lg' : ''}
        `}>
          <div 
            onClick={(e) => { e.stopPropagation(); toggleComplete(note); }}
            className="absolute top-4 right-4 z-20 cursor-pointer"
          >
             {note.completed ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors" />
            )}
          </div>

          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex flex-col gap-1.5">
                <CardTitle className={`text-xl font-bold leading-tight text-slate-900 transition-colors line-clamp-2 ${note.completed ? 'text-slate-400' : ''}`}>
                    {note.title}
                </CardTitle>
                <p className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-500 line-clamp-3 ${note.completed ? 'text-slate-300' : ''}`}>
                    {note.content}
                </p>
            </div>
          </CardHeader>
          
          <div className="px-5 pb-5 mt-4">
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100">
                            {note.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                            {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    {isSelected && note.due_date && (
                        <div className="flex items-center gap-1.5 text-rose-500">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                Due {new Date(note.due_date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                    onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                    >
                    <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function App() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].name)
  const [dueDate, setDueDate] = useState('')
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed">("All")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [isFormOpen, setIsFormOpen] = useState(false)
  
  const { data: notes, isLoading } = useQuery<Note[]>({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    }
  })

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: { title: string; content: string; category: string; due_date?: string }) => {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      setTitle('')
      setContent('')
      setCategory(CATEGORIES[0].name)
      setDueDate('')
      setIsFormOpen(false)
      toast.success('Note created successfully')
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: { id: number; title?: string; content?: string; completed?: boolean }) => {
      const response = await fetch(`${API_URL}/${updatedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      })
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      if (variables.completed !== undefined) {
        toast.success(variables.completed ? 'Note completed' : 'Note active')
      }
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      toast.success('Note deleted', {
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo delete not implemented in backend yet')
        }
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    
    let formattedContent = content
    if (category === "Tasks") {
      formattedContent = content.split('\n').map(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('•') && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
          return `• ${trimmed}`
        }
        return line
      }).join('\n')
    }

    createNoteMutation.mutate({ 
      title, 
      content: formattedContent, 
      category,
      due_date: dueDate || undefined
    })
  }

  const toggleComplete = (note: Note) => {
    updateNoteMutation.mutate({ id: note.id, completed: !note.completed })
  }

  const filteredNotes = useMemo(() => {
    return notes?.filter(note => {
        const matchesStatus = 
            statusFilter === "All" ? true :
            statusFilter === "Completed" ? note.completed : !note.completed
        
        const matchesCategory = 
            categoryFilter === "All" ? true : note.category === categoryFilter
            
        return matchesStatus && matchesCategory
    })
  }, [notes, statusFilter, categoryFilter])

  const placeholderText = useMemo(() => {
    switch(category) {
        case "Tasks": return "Add checklist items..."
        case "Ideas": return "Capture the idea before it disappears..."
        case "Work": return "Meeting notes, project details..."
        default: return "Write your note..."
    }
  }, [category])

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-black tracking-tight text-slate-900">NOTES</h1>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {filteredNotes?.length || 0} Total
                </span>
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                    NI
                </div>
            </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        
        {/* Filters Section */}
        <div className="mb-8 space-y-6">
            {/* Status Filters */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {["All", "Active", "Completed"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            statusFilter === s 
                            ? 'bg-white text-slate-900 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={() => setCategoryFilter("All")}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        categoryFilter === "All"
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    All Categories
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.name}
                        onClick={() => setCategoryFilter(cat.name)}
                        className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            categoryFilter === cat.name
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                        <cat.icon className={`h-3 w-3 ${categoryFilter === cat.name ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        {cat.name}
                        {categoryFilter === cat.name && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </button>
                ))}
            </div>
        </div>

        {/* Notes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-white animate-pulse shadow-sm border border-slate-100" />
              ))
            ) : filteredNotes?.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full py-24 text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 mb-6">
                    <StickyNote className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No notes here yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Create your first note to start organizing your thoughts and tasks.
                </p>
                <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-6 h-12 font-bold"
                >
                    Create Note
                </Button>
              </motion.div>
            ) : filteredNotes?.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <NoteCard 
                    note={note} 
                    toggleComplete={toggleComplete} 
                    deleteNote={(id) => deleteNoteMutation.mutate(id)} 
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsFormOpen(true)}
        aria-label="Create Note"
        className="fixed bottom-8 right-8 h-16 w-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Plus className="h-8 w-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* New Note Overlay Form */}
      <AnimatePresence>
        {isFormOpen && (
            <>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsFormOpen(false)}
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                />
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-[32px] shadow-2xl max-w-2xl mx-auto border-t border-slate-200 lg:bottom-8 lg:rounded-[32px] lg:border"
                >
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900">NEW NOTE</h2>
                            <button 
                                onClick={() => setIsFormOpen(false)}
                                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Give it a title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-none bg-transparent p-0 text-3xl font-black placeholder:text-slate-200 focus-visible:ring-0 h-auto"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.name}
                                            type="button"
                                            onClick={() => {
                                                setCategory(cat.name)
                                                if (cat.name === "Tasks" && content === "") {
                                                    setContent('• ')
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                category === cat.name
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                                                    : 'bg-slate-50 text-slate-500 border-transparent hover:border-slate-200'
                                            }`}
                                        >
                                            <cat.icon className={`h-4 w-4 ${category === cat.name ? 'text-white' : 'text-slate-400'}`} />
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="datetime-local"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="pl-12 bg-slate-50 border-transparent focus:border-slate-200 rounded-xl h-12 text-sm font-bold text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Textarea
                                    placeholder={placeholderText}
                                    value={content}
                                    onChange={(e) => {
                                        let val = e.target.value
                                        if (category === "Tasks" && val.length === 1 && !val.startsWith('•')) {
                                            val = '• ' + val
                                        }
                                        setContent(val)
                                    }}
                                    onKeyDown={(e) => {
                                        if (category === "Tasks" && e.key === 'Enter') {
                                            e.preventDefault()
                                            const target = e.target as HTMLTextAreaElement
                                            const start = target.selectionStart
                                            const end = target.selectionEnd
                                            const value = target.value
                                            
                                            const before = value.substring(0, start)
                                            const after = value.substring(end)
                                            
                                            const lines = before.split('\n')
                                            const currentLine = lines[lines.length - 1]
                                            
                                            if (currentLine.trim() === '•') {
                                                const newBefore = lines.slice(0, -1).join('\n') + (lines.length > 1 ? '\n' : '')
                                                setContent(newBefore + after)
                                                setTimeout(() => {
                                                    target.selectionStart = target.selectionEnd = newBefore.length
                                                }, 0)
                                            } else {
                                                const newValue = before + '\n• ' + after
                                                setContent(newValue)
                                                setTimeout(() => {
                                                    target.selectionStart = target.selectionEnd = start + 3
                                                }, 0)
                                            }
                                        }
                                    }}
                                    className="border-none bg-transparent p-0 text-lg font-medium text-slate-600 placeholder:text-slate-300 focus-visible:ring-0 min-h-[200px] resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={createNoteMutation.isPending} 
                                    className="flex-grow h-14 rounded-2xl text-base font-black bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                >
                                    {createNoteMutation.isPending ? 'SAVING...' : 'SAVE NOTE'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App