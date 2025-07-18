import express from "express";
import dotenv from "dotenv";
import connectDB from "./src/config/mongodb.js";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import cors from "cors";
dotenv.config();



const app = express();
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin:'https://e-vote-frontend.vercel.app',
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();


app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
 
    console.log(`Server started on port ${PORT}`);

});
