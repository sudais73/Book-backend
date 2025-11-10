import express from 'express'
import 'dotenv/config'
import AuthRoutes from './routes/AuthRoures.js'
import connectDB from './config/db.js'
import bookRoutes from './routes/bookRoutes.js'
import cors from 'cors'

const app= express()
app.use(express.json()); 
app.use(cors());
const port = process.env.PORT || 3000
connectDB()

app.use('/api/auth',AuthRoutes )
app.use('/api/books',bookRoutes)

app.get("/", (req,res)=>{
res.send('Nice to meet you!')
})

app.listen(port, ()=>{
console.log(`server is listining to port:${port}`)
})