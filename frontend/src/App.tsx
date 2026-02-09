import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, StickyNote, Pencil, X, Check } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'

interface Note {
  id: number
  title: string
  content: string
  created_at: string
}

const API_URL = 'https://note-app.wordlyte.com/api/notes'

function App() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
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

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: { title: string; content: string }) => {
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
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: { id: number; title: string; content: string }) => {
      const response = await fetch(`${API_URL}/${updatedNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: updatedNote.title, content: updatedNote.content }),
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
    createNoteMutation.mutate({ title, content })
  }

  const startEditing = (note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId || !editTitle || !editContent) return
    updateNoteMutation.mutate({ id: editingId, title: editTitle, content: editContent })
  }

  return (
    <div className="min-h-screen bg-background p-8 font-sans text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
            <StickyNote className="h-10 w-10 text-primary" />
            Note Master
          </h1>
          <p className="text-muted-foreground">Capture your thoughts, organizing your life.</p>
        </div>

        <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>Create a Note</CardTitle>
            <CardDescription>Add a new thought to your collection.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-muted/50"
              />
              <Textarea
                placeholder="Content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-muted/50 min-h-[100px]"
              />
              <Button type="submit" disabled={createNoteMutation.isPending} className="w-full sm:w-auto">
                {createNoteMutation.isPending ? 'Creating...' : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Note
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="col-span-full text-center py-10 text-muted-foreground">Loading notes...</p>
          ) : notes?.length === 0 ? (
            <p className="col-span-full text-center py-10 text-muted-foreground">No notes yet. Create one above!</p>
          ) : notes?.map((note) => (
            <Card key={note.id} className="relative group overflow-hidden border-2 transition-all hover:border-primary/30 hover:shadow-md">
              {editingId === note.id ? (
                <div className="p-4 space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-8"
                  />
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdate} disabled={updateNoteMutation.isPending}>
                      <Check className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <CardTitle className="pr-8 truncate text-lg">{note.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(note.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground line-clamp-4">
                      {note.content}
                    </p>
                  </CardContent>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => startEditing(note)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App
