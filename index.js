import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import userRoutes from './routes/userRoutes.js'
import adminRoutes from './routes/adminRoutes.js';
import cors from 'cors'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: 'https://aura-fits-frontend-16bj.vercel.app', 
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



connectDB();
app.use('/api',userRoutes);
app.use('/api/admin',adminRoutes);


app.listen(PORT, () => {
  console.log(`Server started on port https://aura-fits-frontend-16bj.vercel.app`);
});
  