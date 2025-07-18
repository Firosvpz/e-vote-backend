import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import cors from "cors";
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';


const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    // origin: 'http://localhost:5173',
    origin:'https://e-vote-frontend.vercel.app/api',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(
    `Server started on port https://e-vote-frontend.vercel.app/`,
  );
});
