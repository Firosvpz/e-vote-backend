import express from "express";
import {
  register,
  login,
  userProfile,
  getElections,
  pollVote,
  getResults,
  getElectionDetails,
} from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.get("/profile/:userId",authMiddleware, userProfile);
router.get('/getElections',getElections)
router.post('/pollVote/:electionId',authMiddleware,pollVote)
router.get('/getResults',getResults)
router.get('/electionDetails/:electionId',getElectionDetails)


export default router;
