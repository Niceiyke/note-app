import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { NoteCreateSchema, NoteUpdateSchema } from '../schemas/note.schema'

const router = Router()

// Create a note
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = NoteCreateSchema.parse(req.body)
    const note = await prisma.note.create({
      data: {
        ...validatedData,
        due_date: validatedData.due_date ? new Date(validatedData.due_date) : null
      }
    })
    res.json(note)
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Invalid data' })
  }
})

// Read all notes
router.get('/', async (req: Request, res: Response) => {
  const skip = parseInt(req.query.skip as string) || 0
  const limit = parseInt(req.query.limit as string) || 100
  
  const notes = await prisma.note.findMany({
    skip,
    take: limit,
    orderBy: { created_at: 'desc' }
  })
  res.json(notes)
})

// Read one note
router.get('/:id', async (req: Request, res: Response) => {
  const note = await prisma.note.findUnique({
    where: { id: parseInt(req.params.id) }
  })
  
  if (!note) {
    return res.status(404).json({ detail: 'Note not found' })
  }
  res.json(note)
})

// Update a note
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = NoteUpdateSchema.parse(req.body)
    const noteId = parseInt(req.params.id)
    
    const updateData: any = { ...validatedData }
    if (validatedData.due_date !== undefined) {
      updateData.due_date = validatedData.due_date ? new Date(validatedData.due_date) : null
    }

    const note = await prisma.note.update({
      where: { id: noteId },
      data: updateData
    })
    res.json(note)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ detail: 'Note not found' })
    }
    res.status(400).json({ error: error.message || 'Invalid data' })
  }
})

// Delete a note
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.note.delete({
      where: { id: parseInt(req.params.id) }
    })
    res.json({ ok: true })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ detail: 'Note not found' })
    }
    res.status(500).json({ error: error.message })
  }
})

export default router
