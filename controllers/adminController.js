import Booking from "../models/bookingSchema.js";
import Plan from "../models/planModel.js";
import User from "../models/userModel.js";
import { sendStatusUpdateEmail } from "../services/email.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.EMAIL_USER;
    const adminPassword = process.env.ADMIN_PASS;

    // Validate credentials directly with env
    if (email !== adminEmail || password !== adminPassword) {
      return res.status(400).json({ msg: 'Invalid admin credentials' });
    }

    res.status(200).json({
      msg: 'Admin login successful',
      user: {
        id: 'admin123',
        name: 'Admin',
        email: adminEmail,
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
    console.log('Users:', users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      phoneNumber: user.phoneNumber,
      joinedAt: user.joinedAt,
    })));
    
    return res.status(200).json({
      msg: 'Users fetched successfully',
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        phoneNumber: user.phoneNumber,
        joinedAt: user.joinedAt,
      }))
    });

  } catch (error) {
    res.status(500).json({ error: err.message });
  }
}

export const addPlan = async (req, res) => {
  try {

    const { planName, planType, price, description } = req.body;

    // Validate input
    if (!planName || !planType || !price || !description) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    // Here you would typically save the plan to the database
    const savePlan = new Plan({ // Assuming Plan is imported from models/planModel.js
      planName,
      planType,
      price,
      description
    });

    await savePlan.save();

    // For this example, we'll just return a success message
    res.status(201).json({
      msg: 'Plan added successfully',
      plan: {
        planName,
        planType,
        price,
        description
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});

    if (plans.length === 0) {
      return res.status(404).json({ msg: 'No plans found' });
    }

    res.status(200).json({
      msg: 'Plans fetched successfully',
      plans: plans.map(plan => ({
        id: plan._id,
        planName: plan.planName,
        planType: plan.planType,
        price: plan.price,
        description: plan.description,
        subscribers: plan.subscribers,
        createdAt: plan.createdAt
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('userId', 'name email').populate('planId', 'planName price');

    if (bookings.length === 0) {
      return res.status(404).json({ msg: 'No bookings found' });
    }

    // console.log('Bookings:', bookings.map(booking => ({
    //     id: booking._id,
    //     user: booking.userId,
    //     plan: booking.planId,
    //     bookingDate: booking.bookingDate,
    //     status: booking.status


    //   })));


    res.status(200).json({
      msg: 'Bookings fetched successfully',
      bookings: bookings.map(booking => ({
        id: booking._id,
        userName: booking.userId.name,
        userEmail: booking.userId.email,
        planName: booking.planId.planName,
        planType: booking.planId.planType,
        price: booking.planId.price,
        bookingDate: booking.bookingDate,
        status: booking.status
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;

    // Validate input
    if (!bookingId || !status) {
      return res.status(400).json({ msg: 'Booking ID and status are required' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('userId', 'email name').populate('planId', 'planName');
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
  console.log('booking:', booking);
  
    // Update the booking status
    booking.status = status;
    await booking.save();
    const userEmail = booking.userId.email; 
    const userName = booking.userId.name;
    const planName = booking.planId.planName;

    await sendStatusUpdateEmail(userEmail, status, planName,userName);
    res.status(200).json({
      msg: 'Booking status updated successfully',
      booking: {
        id: booking._id,
        userName: booking.userId.name,
        planName: booking.planId.planName,
        status: booking.status
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}