import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Election from "../models/electionModel.js";
import Candidate from "../models/candidateModel.js";
import Vote from "../models/voteModel.js";
import mongoose from "mongoose";
import ElectionResult from "../models/resultModel.js";
import { sendVotingConfirmationEmail } from "../services/email.js";


// Register a new user
// This function allows a user to register
export const register = async (req, res) => {
  try {
    const { studentId, name, email, phoneNumber, password, department, academicLevel } = req.body

    // check if user exists
    const existingUser = await User.findOne({ $or: [{ studentId }, { email }], });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user
    const newUser = new User({
      studentId,
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      department,
      academicLevel,
    });
    await newUser.save();


    res.status(201).json({ msg: `${name} registered successfully`, data: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Login a user
// This function allows a user to log in using their student ID , email and password
export const login = async (req, res) => {
  try {
    // console.log(req.body);

    const { studentId, email, password } = req.body;

    // check user
    const user = await User.findOne({ $or: [{ studentId }, { email }], });
    if (!user) return res.status(400).json({ msg: "Invalid student id or email" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password " });

    // sign token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      msg: "user logged successfully",
      token,
      user: { id: user._id, studentId: studentId, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user profile
// This function retrieves a user's profile by their ID
export const userProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// list elections 
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

    const eligibleVotersCount = await User.find({}).countDocuments()

    return res.status(200).json({
      msg: "List of all elections (date-only based)",
      data: updatedElections,
      statusCounts,
      eligibleVotersCount
    });

  } catch (error) {
    console.error("Error fetching elections:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

// vote polling

export const pollVote = async (req, res) => {
  try {

    const { electionId } = req.params;
    const { candidateId } = req.body;
    const voterId = req.user._id;;
    const toEmail = req.user.email
    const userName = req.user.name

    // console.log(electionId,candidateId,voterId);


    // Step 1: Verify the election exists
    const election = await Election.findById(electionId).populate("candidates");
    if (!election) return res.status(404).json({ message: "Election not found" });

    // Step 2: Check if the candidate is part of this election
    const candidateExists = election.candidates.find(
      (candidate) => candidate._id.toString() === candidateId
    );
    if (!candidateExists)
      return res.status(400).json({ message: "Candidate does not belong to this election" });

    // Step 3: Check if user already voted in this election (optional logic)
    const existingVote = await Vote.findOne({ election: electionId, voter: voterId });
    if (existingVote) return res.status(400).json({ message: "You have already voted" });

    // Step 4: Save vote to DB
    await Vote.create({
      election: electionId,
      voter: voterId,
      candidate: candidateId,
    });

    // Step 5: Increment vote counts
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { $inc: { votes: 1 } },
      { new: true }
    );
    const updatedElection = await Election.findByIdAndUpdate(
      electionId,
      { $inc: { totalVotes: 1 } },
      { new: true }
    );



    const receiptId = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;

    sendVotingConfirmationEmail(toEmail, {
      title: election.title,
      voteDate: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      selectedOption: candidateExists.name,
      receiptId: receiptId,
    }, userName);
    

    return res.status(200).json({
      message: "Vote submitted successfully",
      candidate: updatedCandidate,
      election: updatedElection,
      receiptId
    });
  } catch (error) {
    console.error("Error in pollVote:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get results 
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
}

// elections details
export const getElectionDetails = async (req, res) => {
  try {
    const { electionId } = req.params
    const election = await Election.findById({ _id: electionId })
      .populate({ path: 'candidates', select: "studentId name position department votes" })
    return res.status(200).json({
      message: "successfully fetched data by specific id ", data: election
    })
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
}
