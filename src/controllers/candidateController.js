import Candidate from "../models/candidateModel.js";
import User from "../models/userModel.js";
//  Candidate Management
// This section contains functions for managing candidates in the election system.

// Add a new candidate
// This function allows an admin to add a new candidate by existing the student's ID
export const addCandidate = async (req, res) => {
  try {
    const { studentId, position } = req.body;

    const user = await User.findOne({ studentId });
    if (!user) {
      return res.status(404).json({ msg: "Student ID not found in Users database" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ msg: "User is not verified" });
    }


    const existingCandidate = await Candidate.findOne({ studentId });
    if (existingCandidate)
      return res.status(400).json({ msg: "Candidate already exists" ,});

    const newCandidate = new Candidate({
      studentId,
      name: user.name,
      position,
      department: user.department,
      academicLevel: user.academicLevel,

    });
    await newCandidate.save();

    res.status(201).json({ msg: `${newCandidate.name} added as a candidate successfully` ,data:newCandidate});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get all candidates
// This function retrieves all candidates from the database
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    const totalCandidates = candidates.length
    const activeCandidates = candidates.filter((c) => !c.isWinner).length
    const winners = candidates.filter((c) => c.isWinner).length
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0)

    return res.status(200).json({
      msg: "Candidates fetched successfully",
      data: candidates,
      totalCandidates,
      activeCandidates,
      winners,
      totalVotes
    });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
}

// Update a candidate's details
// This function allows an admin to update a candidate's details by their ID
export const updateCandidate = async (req, res) => {
  try {
    // console.log('body',req.body);
    
    const { candidateId } = req.params;
    const { name, position, votes, isWinner } = req.body;

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      candidateId,
      { name, position, votes, isWinner },
      { new: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({ msg: "Candidate not found" });
    }

    res.status(200).json({ msg: "Candidate updated successfully", data:updatedCandidate });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error(err);
    
  }
}

// Delete a candidate
// This function allows an admin to delete a candidate by their ID
export const deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    const deletedCandidate = await Candidate.findByIdAndDelete(candidateId);

    if (!deletedCandidate) {
      return res.status(404).json({ msg: "Candidate not found" });
    }

    res.status(200).json({ msg: "Candidate deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}