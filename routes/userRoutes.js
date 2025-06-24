import express from 'express';
import { register, login, getMembershipPlans, bookingPlan, getBookings, userProfile } from '../controllers/userController.js'

const router = express.Router();

router.post('/signup', register);
router.post('/login', login);
router.get('/getMemberships', getMembershipPlans);
router.post('/bookingPlan',bookingPlan);
router.get('/getBookings/:userId', getBookings);
router.get('/profile/:userId',userProfile)
export default router;