// models/ElectionResult.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const voteBreakdownSchema = new Schema({
  candidate: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  votes: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  }
}, { _id: false });

const electionResultSchema = new Schema({
  election: {
    type: Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
    unique: true
    // Removed index: true to prevent duplicate index
  },
  totalVotes: {
    type: Number,
    required: true,
    min: 0
  },
  turnoutPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  winners: [{
    type: Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  voteBreakdown: [voteBreakdownSchema],
  isTie: {
    type: Boolean,
    default: false
  },
  tieBreakReason: String,
  publishedAt: {
    type: Date,
    default: Date.now
  },
  publishedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Define indexes separately (only once)
electionResultSchema.index({ election: 1 });
electionResultSchema.index({ publishedAt: -1 });

const ElectionResult = mongoose.model('ElectionResult', electionResultSchema);
export default ElectionResult;