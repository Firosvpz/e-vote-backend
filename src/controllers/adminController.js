import Election from "../models/electionModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin login using environment variables
// This is a simple admin login that checks against environment variables for email and password.
export const adminLogin = async (req, res) => {
  try {
   
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate credentials directly with env
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(400).json({ msg: "Invalid admin credentials" });
    }
    // sign token
    const token = jwt.sign({ id: email._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      msg: "Admin login successful",
      token,
      admin: {
        id: "admin123",
        name: "Admin",
        email: adminEmail,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// User Management
// This section contains functions for managing users.

// Get all users
// This function retrieves all users from the database
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({});

    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = totalUsers - verifiedUsers;


    return res.status(200).json({
      msg: "Users fetched successfully",
      data: users,
      totalUsers,
      verifiedUsers,
      unverifiedUsers
    });
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new user
// This function allows an admin to add a new user by providing their details
export const addUser = async (req, res) => {
  try {
    const { studentId, name, email, phoneNumber, password, department, academicLevel } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ studentId }, { email }] });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
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

    res.status(201).json({ msg: `${name} registered successfully`, newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a user
// This function allows an admin to update a user's details by their ID
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phoneNumber, department, academicLevel } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phoneNumber, department, academicLevel },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User updated successfully", updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete a user
// This function allows an admin to delete a user by their ID
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify a user
// This function allows an admin to verify a user by their details
export const verifyUser = async (req, res) => {
  try {

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    user.isVerified = true;
    await user.save();
    res.status(200).json({ msg: "User verified successfully", user });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// dashboard management
export const dashboard = async (req, res) => {
  try {
    //  Total users and verified users
    const totalUsers = await User.countDocuments()
    const verifiedUsers = await User.countDocuments({ isVerified: true })
    const unverifiedUsers = totalUsers - verifiedUsers

    //  Election data
    const allElections = await Election.find({})
    const activeElections = await Election.countDocuments({ status: 'Active' })

    //  Total votes (depends on how votes are stored)
    const totalVotes = allElections.reduce((sum, election) => sum + (election.totalVotes || 0), 0)

    res.status(200).json({
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      activeElections,
      totalVotes,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}

