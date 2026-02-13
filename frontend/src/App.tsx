import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Trash2, StickyNote, CheckCircle2, Circle, 
  Briefcase, Home, Lightbulb, CheckSquare, BookOpen
} from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'

interface Note {
  id: number
  title: string
  content: string
  category: string
  completed: boolean
  created_at: string
}

const API_URL = 'https://note-app.wordlyte.com/api/notes/'

const CATEGORIES = [
  { name: "Work", icon: Briefcase, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  { name: "Personal", icon: Home, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  { name: "Ideas", icon: Lightbulb, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  { name: "Tasks", icon: CheckSquare, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
  { name: "Reference", icon: BookOpen, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
]

function NoteCard({ note, toggleComplete, deleteNote }: { note: Note, toggleComplete: (n: Note) => void, deleteNote: (id: number) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-100, 100], [-5, 5])

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
        className="relative z-10 touch-pan-y"
      >
        <Card className={`group relative h-full flex flex-col transition-all duration-200 border border-slate-200 shadow-sm hover:shadow-md
            ${note.completed ? 'bg-slate-50 opacity-60' : 'bg-white'}
        `}>
          <CardHeader className="pb-2 pt-5 px-5">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100">
                            {note.category}
                        </span>
                    </div>
                    <CardTitle className={`text-lg font-bold leading-tight text-slate-900 transition-colors line-clamp-2 ${note.completed ? 'line-through text-slate-400' : ''}`}>
                        {note.title}
                    </CardTitle>
                </div>
                <button onClick={() => toggleComplete(note)} className="shrink-0 transition-transform active:scale-90 mt-0.5">
                    {note.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                        <Circle className="h-5 w-5 text-slate-300 hover:text-slate-400 transition-colors" />
                    )}
                </button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow px-5 pb-5">
            <p className={`whitespace-pre-wrap text-sm leading-relaxed text-slate-600 line-clamp-4 ${note.completed ? 'line-through' : ''}`}>
              {note.content}
            </p>
          </CardContent>

          <div className="px-5 pb-4 flex justify-between items-center border-t border-slate-50 pt-3 mt-auto">
            <span className="text-[10px] font-medium text-slate-400">
                {new Date(note.created_at).toLocaleDateString()}
            </span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                onClick={() => deleteNote(note.id)}
                >
                <Trash2 className="h-4 w-4" />
                </Button>
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
  const [filter, setFilter] = useState("All")
  
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
    mutationFn: async (newNote: { title: string; content: string; category: string }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
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
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    createNoteMutation.mutate({ title, content, category })
  }

  const toggleComplete = (note: Note) => {
    updateNoteMutation.mutate({ id: note.id, completed: !note.completed })
  }

  const filteredNotes = notes?.filter(note => {
    if (filter === "All") return true
    if (filter === "Completed") return note.completed
    if (filter === "Active") return !note.completed
    return note.category === filter
  })

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="mx-auto max-w-6xl">
        
        {/* Header - Simplified */}
        <div className="mb-10 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Notes</h1>
            <div className="text-sm font-medium text-slate-500">
                {filteredNotes?.length || 0} notes
            </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Create Section (Left Column) */}
          <div className="lg:col-span-4">
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-slate-900">
                        New Note
                    </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                    <Input
                      placeholder="Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-slate-50 border-slate-200 h-10 px-3 text-sm font-medium rounded-lg focus-visible:ring-slate-900"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                     <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.name}
                                type="button"
                                onClick={() => setCategory(cat.name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
                                    ${category === cat.name
                                        ? 'bg-slate-900 text-white border-slate-900' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Content</label>
                    <Textarea
                      placeholder="Write something..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-slate-50 border-slate-200 px-3 py-3 text-sm font-medium rounded-lg focus-visible:ring-slate-900 min-h-[120px] resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={createNoteMutation.isPending} className="w-full h-10 rounded-lg text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all">
                    {createNoteMutation.isPending ? 'Saving...' : 'Save Note'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* List Section (Right Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Unified Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200">
                <button
                    onClick={() => setFilter("All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "All" ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    All
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                {["Active", "Completed"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        {f}
                    </button>
                ))}
                <div className="w-px h-4 bg-slate-300 mx-1"></div>
                {CATEGORIES.map(f => (
                    <button
                        key={f.name}
                        onClick={() => setFilter(filter === f.name ? "All" : f.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors 
                            ${filter === f.name 
                                ? 'bg-slate-900 text-white' 
                                : 'text-slate-500 hover:bg-slate-100'
                            }`}
                    >
                        {f.name}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-xl bg-white animate-pulse shadow-sm border border-slate-100" />
                  ))
                ) : filteredNotes?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-16 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                        <StickyNote className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium">No notes found.</p>
                  </motion.div>
                ) : filteredNotes?.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
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
          </div>

        </div>
      </div>
    </div>
  )
}

export default App