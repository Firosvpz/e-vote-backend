
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, unique: true },
  department:  {  
    type: String,
    enum: ['BBA', 'BCOM', 'BA', 'BCA','BSC'],
    required: true
  },
  academicLevel: {  
    type: String,
    enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
    required: true
  },
  isVerified: { type: Boolean, default: false },
  // joinedAt: { type: Date, default: Date.now },
},
{
  timestamps: true,
});

const User = mongoose.model("User", userSchema);
export default User;
