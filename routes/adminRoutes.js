import express from 'express';
import { addPlan, adminLogin, getBookings, getPlans, getUsers, updateBookingStatus } from '../controllers/adminController.js';
const router = express.Router();

router.post('/adminLogin', adminLogin);
router.post('/addPlan',addPlan);
router.get('/getUsers',getUsers)
router.get('/getPlans', getPlans);
router.get('/getBookings', getBookings);
router.post('/updateBookingStatus',updateBookingStatus)
export default router;