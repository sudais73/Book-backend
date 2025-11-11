import express from 'express'
import 'dotenv/config'
import AuthRoutes from './routes/AuthRoures.js'
import connectDB from './config/db.js'
import bookRoutes from './routes/bookRoutes.js'
import cors from 'cors'

const app= express()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
const PORT= process.env.PORT || 3000
connectDB()

app.use('/api/auth',AuthRoutes )
app.use('/api/books',bookRoutes)

app.get("/", (req,res)=>{
res.send('Nice to meet you!')
})

app.listen(PORT, '0.0.0.0', () => {  // ⬅️ Use '0.0.0.0' not 'localhost'
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://192.168.8.100:${PORT}`);
});