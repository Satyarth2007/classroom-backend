import express from 'express'
import SubjectsRouter from './routes/Subjects.js'
import cors from 'cors'
const app = express()
const PORT = 8000

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.use(express.json())


app.use('/api/subjects', SubjectsRouter)

app.get('/', (req,res) => {
  res.send('Hello, Welcome to the classroom API')
})

app.listen(PORT, () => {
  console.log(`Servwer is running at http://localhost:${PORT}`);
})
