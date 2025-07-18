import mongoose, { Schema } from "mongoose";

const voteSchema = new mongoose.Schema(
    {
        election: {
            type: Schema.Types.ObjectId,
            ref: 'Election',
            required: true
        },
        voter: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        candidate: {
            type: Schema.Types.ObjectId,
            ref: 'Candidate'
        },
        votedAt: { type: Date, default: Date.now },
       

    }
);

voteSchema.index({ election: 1, voter: 1 }, { unique: true });

const Vote = mongoose.model("Vote",voteSchema);
export default Vote

