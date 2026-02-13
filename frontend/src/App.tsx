import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, StickyNote, Check, CheckCircle2, Circle, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

interface Note {
  id: number
  title: string
  content: string
  category: string
  completed: boolean
  created_at: string
}

const API_URL = 'https://note-app.wordlyte.com/api/notes/'

const CATEGORIES = ["Work", "Personal", "Ideas", "Tasks", "Reference"]

function App() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
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
      setCategory(CATEGORIES[0])
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary text-primary-foreground rounded-xl shadow-sm">
                <StickyNote className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Note App
                </h1>
                <p className="text-muted-foreground font-medium">Stay organized and productive.</p>
              </div>
            </div>
          </motion.div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* Create Section (Left Column) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-accent" />
                  New Note
                </CardTitle>
                <CardDescription>Capture your thoughts and tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Note Title</label>
                    <Input
                      placeholder="Enter title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-background border-border focus:ring-accent"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-foreground">Category</label>
                     <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">Content</label>
                    <Textarea
                      placeholder="Write your note here..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-background border-border focus:ring-accent min-h-[120px] resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={createNoteMutation.isPending} className="w-full h-11 rounded-lg text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                    {createNoteMutation.isPending ? 'Saving...' : (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" /> Create Note
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* List Section (Right Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border overflow-x-auto no-scrollbar">
                <div className="px-3 py-1.5 text-muted-foreground">
                    <Filter className="h-4 w-4" />
                </div>
                {["All", "Active", "Completed", ...CATEGORIES].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                            ${filter === f 
                                ? 'bg-primary text-primary-foreground shadow-sm' 
                                : 'bg-background text-muted-foreground hover:bg-muted border border-border'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 rounded-xl bg-muted animate-pulse border border-border" />
                  ))
                ) : filteredNotes?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-16 text-center rounded-xl border-2 border-dashed border-border bg-muted/10"
                  >
                    <StickyNote className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-muted-foreground">No notes found.</p>
                  </motion.div>
                ) : filteredNotes?.map((note, index) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <Card className={`group relative h-full flex flex-col transition-all duration-200 hover:shadow-md rounded-xl overflow-hidden
                        ${note.completed ? 'bg-muted/30' : 'bg-card'}
                        border border-border
                    `}>
                      <CardHeader className="pb-2 pt-5 px-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                                        {note.category}
                                    </span>
                                </div>
                                <CardTitle className={`text-lg font-bold leading-tight text-foreground transition-colors line-clamp-2 ${note.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {note.title}
                                </CardTitle>
                            </div>
                            <button onClick={() => toggleComplete(note)} className="shrink-0 transition-transform active:scale-90 mt-1">
                                {note.completed ? (
                                    <CheckCircle2 className="h-6 w-6 text-accent" />
                                ) : (
                                    <Circle className="h-6 w-6 text-muted-foreground/30 hover:text-accent transition-colors" />
                                )}
                            </button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-grow px-5 pb-5">
                        <p className={`whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground line-clamp-4 ${note.completed ? 'line-through opacity-50' : ''}`}>
                          {note.content}
                        </p>
                      </CardContent>

                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                            onClick={() => deleteNoteMutation.mutate(note.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </Card>
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