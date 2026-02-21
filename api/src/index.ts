import express, { Request, Response } from 'express'
import cors from 'cors'
import notesRouter from './routers/notes.router'

const app = express()
const port = process.env.PORT || 8000

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://note-app-web.wordlyte.com",
  ],
  credentials: true,
}))

app.use(express.json())

app.use('/api/notes', notesRouter)

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' })
})

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
}

export default app
