import express from "express";
import {
  addPlan,
  adminLogin,
  dashboardStats,
  getBookings,
  getPlans,
  getUsers,
  updateBookingStatus,
} from "../controllers/adminController.js";
const router = express.Router();

router.post("/adminLogin", adminLogin);
router.post("/addPlan", addPlan);
router.get("/getUsers", getUsers);
router.get("/getPlans", getPlans);
router.get("/getBookings", getBookings);
router.post("/updateBookingStatus", updateBookingStatus);
router.get('/dashboard',dashboardStats)
export default router;
