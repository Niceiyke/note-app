import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Scroll, Sword, Shield, Skull, Crown, CheckCircle2, Circle, Search, Filter } from 'lucide-react'
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

const CATEGORIES = ["Main Quest", "Side Quest", "Lore", "Inventory", "NPCs"]

function App() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [filter, setFilter] = useState("All")
  
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

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

  // Calculate RPG Stats
  const completedNotes = notes?.filter(n => n.completed).length || 0
  const totalXP = completedNotes * 10
  const level = Math.floor(totalXP / 100) + 1
  const nextLevelXP = level * 100
  const progress = ((totalXP % 100) / 100) * 100

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
      setEditingId(null)
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-primary">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-4 border-double border-primary/20 pb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary text-secondary rounded-lg shadow-lg border-2 border-secondary">
                <Scroll className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-5xl font-rpg font-bold tracking-wider text-primary drop-shadow-sm">
                  Quest Log
                </h1>
                <p className="text-lg font-rpg text-primary/70 font-semibold ml-1 tracking-wide">Manage your adventures.</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6 bg-card/50 backdrop-blur-sm p-4 rounded-lg border-2 border-primary/30 shadow-md min-w-[300px]"
          >
            <div className="flex flex-col items-center justify-center px-4 border-r-2 border-primary/20">
              <span className="text-xs font-rpg font-bold text-primary/60 uppercase">Level</span>
              <span className="text-4xl font-rpg font-bold text-destructive">{level}</span>
            </div>
            <div className="flex-grow space-y-2">
              <div className="flex justify-between text-xs font-bold font-rpg uppercase text-primary/70">
                <span>Experience</span>
                <span>{totalXP} / {nextLevelXP} XP</span>
              </div>
              <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/20 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-secondary to-accent relative"
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
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
            className="lg:col-span-4 space-y-8"
          >
            <Card className="sticky top-8 border-4 border-primary/80 bg-card shadow-xl overflow-hidden rounded-lg">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
              <div className="absolute bottom-0 left-0 w-full h-2 bg-primary" />
              <CardHeader className="bg-primary/5 pb-6 border-b border-primary/10">
                <div className="flex items-center gap-3">
                  <Sword className="h-6 w-6 text-destructive rotate-45" />
                  <CardTitle className="text-2xl font-rpg text-primary">New Quest</CardTitle>
                </div>
                <CardDescription className="font-sans text-primary/60 italic">Define your next objective.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-rpg font-bold text-primary uppercase tracking-widest ml-1">Objective Title</label>
                    <Input
                      placeholder="e.g., Slay the Bug..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 bg-white/50 border-2 border-primary/20 focus:border-accent focus:ring-accent transition-all rounded-md font-rpg text-lg placeholder:text-primary/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-rpg font-bold text-primary uppercase tracking-widest ml-1">Quest Type</label>
                     <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-12 px-3 bg-white/50 border-2 border-primary/20 rounded-md font-rpg text-primary focus:outline-none focus:border-accent appearance-none cursor-pointer"
                        style={{ backgroundImage: 'none' }} // Remove default arrow if customized
                     >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-rpg font-bold text-primary uppercase tracking-widest ml-1">Details</label>
                    <Textarea
                      placeholder="Describe the task..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="bg-white/50 border-2 border-primary/20 focus:border-accent focus:ring-accent transition-all rounded-md min-h-[160px] resize-none font-sans text-primary/80"
                    />
                  </div>
                  <Button type="submit" disabled={createNoteMutation.isPending} className="w-full h-14 rounded-md text-lg font-rpg tracking-wider bg-primary text-secondary hover:bg-primary/90 hover:text-white border-2 border-secondary shadow-md transition-all active:scale-95">
                    {createNoteMutation.isPending ? 'Scribing...' : (
                      <span className="flex items-center gap-2">
                        <Crown className="h-5 w-5" /> Accept Quest
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* List Section (Right Column) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
                <Filter className="h-5 w-5 text-primary/50" />
                {["All", "Active", "Completed", ...CATEGORIES].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-rpg font-bold uppercase tracking-wider transition-all
                            ${filter === f 
                                ? 'bg-primary text-secondary shadow-md scale-105' 
                                : 'bg-white/50 text-primary/60 hover:bg-primary/10'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-64 rounded-lg bg-primary/5 animate-pulse border-2 border-primary/10" />
                  ))
                ) : filteredNotes?.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center rounded-lg border-2 border-dashed border-primary/20 bg-primary/5"
                  >
                    <Shield className="h-16 w-16 text-primary/20 mx-auto mb-4" />
                    <p className="text-xl font-rpg font-bold text-primary/40">No quests found.</p>
                  </motion.div>
                ) : filteredNotes?.map((note, index) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`group relative h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden rounded-sm
                        ${note.completed ? 'opacity-70 bg-primary/5 grayscale-[0.5]' : 'bg-card'}
                        border-2 border-primary/30
                    `}>
                        {/* Decorative Corners */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary/40 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary/40 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary/40 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary/40 rounded-br-lg" />

                      <CardHeader className="pb-3 pt-6 px-6 relative z-10">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 text-[10px] font-rpg font-bold uppercase tracking-widest rounded-sm border border-primary/20
                                    ${note.category === 'Main Quest' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}
                                `}>
                                    {note.category}
                                </span>
                                <CardTitle className={`text-xl font-rpg leading-tight text-primary transition-colors line-clamp-2 ${note.completed ? 'line-through decoration-primary/50' : ''}`}>
                                    {note.title}
                                </CardTitle>
                            </div>
                            <button onClick={() => toggleComplete(note)} className="transition-transform active:scale-90">
                                {note.completed ? (
                                    <CheckCircle2 className="h-8 w-8 text-primary/60" />
                                ) : (
                                    <Circle className="h-8 w-8 text-primary/20 hover:text-accent transition-colors" />
                                )}
                            </button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-grow px-6 pb-6 relative z-10">
                        <p className={`whitespace-pre-wrap font-sans leading-relaxed text-sm text-primary/80 ${note.completed ? 'line-through decoration-primary/30' : ''}`}>
                          {note.content}
                        </p>
                      </CardContent>

                      {/* Actions */}
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-full"
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