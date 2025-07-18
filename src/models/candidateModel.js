
import mongoose, { Schema } from "mongoose";

const candidateSchema = new mongoose.Schema({
    studentId: { type: String, ref: 'User', required: true },
    name: { type: String, required: true },
    position: { type: String, required: true },
    votes: { type: Number, default: 0 },
    isWinner: { type: Boolean, default: false },
    department: {
        type: String,
        enum: ['BBA', 'BCOM', 'BA', 'BCA', 'BSC'],
        required: true
    },
    academicLevel: {
        type: String,
        enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
        required: true
    },
},
    {
        timestamps: true, 
    });

const Candidate = mongoose.model("Candidate", candidateSchema);
export default Candidate;
