import mongoose from "mongoose";
import Candidate from "../models/candidateModel.js";
import Election from "../models/electionModel.js";
import ElectionResult from "../models/resultModel.js";
import User from "../models/userModel.js";
import Vote from "../models/voteModel.js";

// election management 
// create new election
export const createElection = async (req, res) => {
    try {
        const {
            title,
            description,
            electionType,
            startDate,
            endDate,
            priority,
            candidateIds // Array of candidate IDs to associate with this election
        } = req.body;



        // Validate required fields
        if (!title || !description || !electionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check for existing election
        const existElection = await Election.findOne({
            title: { $regex: `^${title}$`, $options: 'i' }  // Case-insensitive exact match
        });

        if (existElection) {
            return res.status(400).json({
                success: false,
                message: "An election with this title already exists",
                field: "title"
            });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({ success: false, message: "Title must be at least 5 characters", field: "title" })
        } else if (title.trim().length > 25) {
            return res.status(400).json({ success: false, message: "Title must be atmost 25 characters", field: "title" })
        }
        if (description.trim().length > 50) {
            return res.status(400).json({ success: false, message: "Description must be atmost 50 characters", field: "description" })
        } else if (description.trim().length < 10) {
            return res.status(400).json({ success: false, message: "Description must be at least 10 characters", field: "description" })
        }

        // Date validation
        const now = new Date();
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        const todayStr = now.toISOString().split('T')[0];
        const startDateStr = parsedStartDate.toISOString().split('T')[0];

        if (startDateStr <= todayStr) {
            return res.status(400).json({
                success: false,
                message: "Start date must be after today",
                field: "startDate"
            });
        }

        if (parsedStartDate >= parsedEndDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date",
                field: "endDate"

            });
        }

        const oneDayInMs = 24 * 60 * 60 * 1000;
        const duration = parsedEndDate - parsedStartDate;

        if (duration !== oneDayInMs) {
            return res.status(400).json({
                success: false,
                message: "Election must be exactly one day long",
                field: "endDate"
            });
        }




        // Verify candidates exist
        let candidates = [];

        // console.log('candidatesId',candidateIds);

        if (candidateIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Two or more candidates must be participated",
                field: "candidateIds"
            });
        }

        if (candidateIds && candidateIds.length > 0) {
            candidates = await Candidate.find({
                studentId: { $in: candidateIds }
            });
            //  console.log('candidates',candidates);

            if (candidates.length !== candidateIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more candidate IDs are invalid",
                    field: "candidateIds"
                });
            }
        }

        // Get eligible voters (verified users)
        const eligibleVoters = await User.find({ isVerified: true }).select('_id');

        // Determine status based on dates



        // Create new election
        const newElection = new Election({
            title,
            description,
            electionType,
            startDate: parsedStartDate,
            endDate: parsedEndDate,
            priority: priority || 'medium',
            eligibleVoters: eligibleVoters.map(user => user._id),
            candidates: candidates.map(candidate => candidate._id),
        });

        // Save to database
        await newElection.save();

        return res.status(201).json({
            success: true,
            message: `${title} election created successfully`,
            data: newElection
        });

    } catch (error) {
        console.error("Error creating election:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


// Elections list 
export const getElections = async (req, res) => {
    try {
        const elections = await Election.find({})
            .populate({ path: 'candidates', select: "studentId name position department" })
            .populate({ path: 'eligibleVoters', select: "name department" });

        // Get current IST date (without time)
        const now = new Date();
        const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const todayStr = istNow.toISOString().split("T")[0]; // 'YYYY-MM-DD'

        const updatedElections = elections.map(election => {
            const startIST = new Date(new Date(election.startDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const endIST = new Date(new Date(election.endDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

            const startStr = startIST.toISOString().split("T")[0];
            const endStr = endIST.toISOString().split("T")[0];

            // console.log('status',election);


            let computedStatus = election.status;

            if (election.status === 'Cancelled') {
                computedStatus = 'Cancelled';
            } else {
                if (todayStr < startStr) {
                    computedStatus = 'Scheduled';
                } else if (todayStr >= startStr && todayStr <= endStr) {
                    computedStatus = 'Active';
                } else if (todayStr > endStr) {
                    computedStatus = 'Completed';
                }
            }

            return {
                ...election.toObject(),
                status: election.status
            };
        });

        // Count statuses
        const statusCounts = updatedElections.reduce((acc, election) => {
            const status = election.status || "unknown";
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        return res.status(200).json({
            msg: "List of all elections (date-only based)",
            data: updatedElections,
            statusCounts
        });

    } catch (error) {
        console.error("Error fetching elections:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};



// update election
export const updateElection = async (req, res) => {
    try {

        const { electionId } = req.params
        const {
            title,
            description,
            electionType,
            status,
            startDate,
            endDate,
            priority,
            candidateIds
        } = req.body;

        // Validate required fields
        if (!title || !description || !electionType || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check for existing election
        const existElection = await Election.findOne({
            title: { $regex: `^${title}$`, $options: 'i' }, // Case-insensitive exact match
            _id: { $ne: electionId }
        });

        if (existElection) {
            return res.status(400).json({
                success: false,
                message: "An election with this title already exists",
                field: "title"
            });
        }

        if (title.trim().length < 5) {
            return res.status(400).json({ success: false, message: "Title must be at least 5 characters", field: "title" })
        } else if (title.trim().length > 25) {
            return res.status(400).json({ success: false, message: "Title must be atmost 25 characters", field: "title" })
        }
        if (description.trim().length > 250) {
            return res.status(400).json({ success: false, message: "Description must be atmost 250 characters", field: "description" })
        } else if (description.trim().length < 10) {
            return res.status(400).json({ success: false, message: "Description must be at least 10 characters", field: "description" })
        }

        // Date validation
        const now = new Date();
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        const todayStr = now.toISOString().split('T')[0];
        const startDateStr = parsedStartDate.toISOString().split('T')[0];

        if (startDateStr <= todayStr) {
            return res.status(400).json({
                success: false,
                message: "Start date must be after today",
                field: "startDate"
            });
        }
        if (parsedStartDate >= parsedEndDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date",
                field: "endDate"

            });
        }

        const oneDayInMs = 24 * 60 * 60 * 1000;
        const duration = parsedEndDate - parsedStartDate;

        if (duration !== oneDayInMs) {
            return res.status(400).json({
                success: false,
                message: "Election must be exactly one day long",
                field: "endDate"
            });
        }




        // Verify candidates exist
        let candidates = [];

        // console.log('candidatesId',candidateIds);

        if (candidateIds && candidateIds.length > 0) {
            candidates = await Candidate.find({
                studentId: { $in: candidateIds }
            });
            //  console.log('candidates',candidates);

            if (candidates.length !== candidateIds.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more candidate IDs are invalid",
                    field: "candidateIds"
                });
            }
        }

        // Get eligible voters (verified users)
        const eligibleVoters = await User.find({ isVerified: true }).select('_id');

        const updatedElection = await Election.findByIdAndUpdate({ _id: electionId },
            {
                title,
                description,
                electionType,
                status, //cancelled,completed
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                priority: priority || 'medium',
                eligibleVoters: eligibleVoters.map(user => user._id),
                candidates: candidates.map(candidate => candidate._id),
            },
            {
                new: true
            }
        )

        res.status(200).json({ message: "Election updated successfully", data: updatedElection })

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error);
    }
}

// preview election details by Id
export const previewElectionById = async (req, res) => {
    try {
        const { electionId } = req.params
        const election = await Election.findById({ _id: electionId })
            .populate({ path: 'candidates', select: "studentId name position department votes" })
            .populate({ path: 'eligibleVoters', select: "name department" });
        return res.status(200).json({
            message: "successfully fetched data by specific id ", data: election
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error);
    }
}

// remove specific election by Id
export const deleteElectionById = async (req, res) => {
    try {
        const { electionId } = req.params
        const deletedElection = await Election.findByIdAndDelete({ _id: electionId })
        res.status(200).json(deletedElection)

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.error(error);
    }
}

// end election
export const endElection = async (req, res) => {
    try {

        const { electionId } = req.params;

        // 1. Verify election exists and close it
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({
                success: false,
                error: 'Election not found'
            });
        }

        // 2. Calculate results
        const votes = await Vote.aggregate([
            { $match: { election: new mongoose.Types.ObjectId(electionId) } },
            {
                $group: {
                    _id: "$candidate",
                    votes: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "candidates",
                    localField: "_id",
                    foreignField: "_id",
                    as: "candidate"
                }
            },
            { $unwind: "$candidate" },
            {
                $project: {
                    candidate: "$candidate._id",
                    votes: 1,
                    studentId: "$candidate.studentId",
                    name: "$candidate.name"
                }
            },
            { $sort: { votes: -1 } }
        ]);

        // Calculate totals
        const totalVotes = votes.reduce((sum, v) => sum + v.votes, 0);
        const totalEligibleVoters = (await User.countDocuments({ isVerified: true })) || 1;
        const turnoutPercentage = Math.round((totalVotes / totalEligibleVoters) * 100 * 10) / 10;

        // Determine winners
        let winners = [];
        let isTie = false;

        if (votes.length > 0) {
            const maxVotes = votes[0].votes;
            winners = votes.filter(c => c.votes === maxVotes).map(c => c.candidate);
            isTie = winners.length > 1;
        }

        // Prepare vote breakdown
        const voteBreakdown = votes.map(candidate => ({
            candidate: candidate.candidate,
            votes: candidate.votes,
            percentage: totalVotes > 0
                ? Math.round((candidate.votes / totalVotes) * 100 * 10) / 10
                : 0
        }));

        // 3. Update election status
        const updatedElection = await Election.findByIdAndUpdate(
            electionId,
            {
                status: 'Completed',
                endedAt: new Date(),
                totalVotes
            },
            { new: true }
        );

        // 4. Create/update results document
        const result = await ElectionResult.findOneAndUpdate(
            { election: electionId },
            {
                totalVotes,
                turnoutPercentage,
                winners,
                voteBreakdown,
                isTie,
                publishedBy: req.user?._id || null
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        ).populate('winners');

        res.status(200).json({
            success: true,
            data: {
                election: updatedElection,
                result
            }
        });
    } catch (error) {
        console.error('Error ending election:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end election',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// get results 
// get results with elections and candidate details
export const getResults = async (req, res) => {
  try {
    const results = await ElectionResult.find({})
      .populate({
        path: 'election',
        model: 'Election',
      })
      .populate({
        path: 'voteBreakdown.candidate',
        model: 'Candidate',
      })
      .populate({
        path: 'winners',
        model: 'Candidate',
      });

    console.log('results', results);

    res.status(200).json({ msg: "Results fetched successfully", data: results });
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ error: error.message });
  }
};
