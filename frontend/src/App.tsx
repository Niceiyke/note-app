import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, StickyNote } from 'lucide-react'
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

const API_URL = 'http://localhost:8000/api/notes'

function App() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

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

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl flex items-center justify-center gap-3">
            <StickyNote className="h-10 w-10" />
            Note Master
          </h1>
          <p className="text-muted-foreground">Capture your thoughts, organizing your life.</p>
        </div>

        <Card>
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
              />
              <Textarea
                placeholder="Content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button type="submit" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? 'Creating...' : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Note
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p>Loading notes...</p>
          ) : notes?.map((note) => (
            <Card key={note.id} className="relative group">
              <CardHeader>
                <CardTitle className="pr-8 truncate">{note.title}</CardTitle>
                <CardDescription>{new Date(note.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground line-clamp-4">
                  {note.content}
                </p>
              </CardContent>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteNoteMutation.mutate(note.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>

      </div>
    </div>
  )
}

export default App
