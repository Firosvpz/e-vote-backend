import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
     planName: { type: String, required: true },
     planType: { type: String, required: true }, // e.g., 'monthly', 'yearly' 
     price: { type: Number, required: true },
     description: [{ type: String, required: true }],
     subscribers: { type: Number, default: 0 },
}, {
     timestamps: true, 
})

const Plan = mongoose.model('Plan', planSchema);
export default Plan;