import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Plan from "../models/planModel.js";
import Booking from "../models/bookingSchema.js";
import { sendStatusUpdateEmail } from "../services/email.js";
export const register = async (req, res) => {
  try {
    // console.log('body',req.body);
    const { name, email, phoneNumber, password } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user
    const newUser = new User({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully" }, newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password " });

    // sign token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMembershipPlans = async (req, res) => {
  try {
    // Fetch all membership plans from the database
    const plans = await Plan.find({});
    if (!plans || plans.length === 0) {
      return res.status(404).json({ msg: "No membership plans found" });
    }
    // Return the plans in the response
    res.status(200).json({ plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const bookingPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    // Validate input
    if (!userId || !planId) {
      return res.status(400).json({ msg: "User ID and Plan ID are required" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ msg: "Plan not found" });

    const booking = new Booking({
      userId: user._id,
      planId: plan._id,
      bookingDate: new Date(),
      status: "pending",
    });
    await booking.save();
    const newBooking = await Booking.findById(booking._id)
      .populate("userId", "name email")
      .populate("planId", "planName");
    console.log("newBooking:", newBooking);

    const userEmail = newBooking.userId.email;
    const userName = newBooking.userId.name;
    const planName = newBooking.planId.planName;
    const status = newBooking.status;
    console.log(
      "userEmail:",
      userEmail,
      " userName:",
      userName,
      "planName:",
      planName,
      "status:",
      status,
    );

    await sendStatusUpdateEmail(userEmail, status, planName, userName);
    res
      .status(200)
      .json({ msg: "Plan booked successfully", plan, user, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log('userId:', userId);
    const bookings = await Booking.find({ userId }).sort({ bookingDate: -1 });

    // Create a map of latest status per plan
    const bookingMap = {};
    for (const booking of bookings) {
      const planId = booking.planId.toString();
      if (!bookingMap[planId]) {
        bookingMap[planId] = booking.status;
      }
    }
    res.status(200).json({ bookings: bookingMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const userProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId:", userId);
    // Fetch user profile by ID
    const user = await User.findById(userId);
    console.log("user:", user);

    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// import User from '../models/userModel.js';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';
// import sendOTPEmail from '../services/mailer.js';
// import { generateOTP } from '../services/otpService.js';

// const otpMap = new Map();

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ msg: 'User already exists' });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const otp = generateOTP();

//     // Store OTP + user data temporarily in otpMap
//     otpMap.set(email, {
//       otp,
//       userData: { name, email, password: hashedPassword },
//       expires: Date.now() + 5 * 60000
//     });

//     await sendOTPEmail(email, otp);

//     res.json({ msg: 'OTP sent to your email for verification.' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
//     if (!user.isVerified) return res.status(400).json({ msg: 'Please verify your email first.' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const record = otpMap.get(email);

//     if (!record) return res.status(400).json({ msg: 'OTP not sent' });
//     if (Date.now() > record.expires) return res.status(400).json({ msg: 'OTP expired' });
//     if (record.otp !== otp) return res.status(400).json({ msg: 'Invalid OTP' });

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ msg: 'User already exists' });

//     const newUser = new User({
//       ...record.userData,
//       isVerified: true,
//     });
//     await newUser.save();

//     otpMap.delete(email);

//     res.json({ msg: 'Email verified and user registered successfully.' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
