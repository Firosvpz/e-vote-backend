import mongoose from "mongoose";
const { Schema } = mongoose;

const electionSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Active', 'Completed', 'Cancelled'],
        default: "Scheduled"
    },
    electionType: {
        type: String,
        enum: ['Department', 'Year', 'General'],
        required: true
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'Start date must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    eligibleVoters: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    totalVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    candidates: [{
        type: String,
        ref: 'Candidate'
    }],
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// Virtual for participation rate
electionSchema.virtual('participationRate').get(function () {
    if (!this.eligibleVoters || this.eligibleVoters.length === 0) return 0;
    return Math.round((this.totalVotes / this.eligibleVoters.length) * 100);
});

// Indexes for better performance
electionSchema.index({ title: 'text' });
electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1, endDate: 1 });
electionSchema.index({ electionType: 1 });

const Election = mongoose.model("Election", electionSchema);
export default Election;