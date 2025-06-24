// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// });

// module.exports = mongoose.model('User', userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phoneNumber: { type: String, unique: true },
  isVerified: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
