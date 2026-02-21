import { z } from 'zod'

export const NoteCreateSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string().optional().default("General"),
  completed: z.boolean().optional().default(false),
  due_date: z.string().datetime().optional().nullable(),
})

export const NoteUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  completed: z.boolean().optional(),
  due_date: z.string().datetime().optional().nullable(),
})

export type NoteCreateInput = z.infer<typeof NoteCreateSchema>
export type NoteUpdateInput = z.infer<typeof NoteUpdateSchema>
