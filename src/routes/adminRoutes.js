import express from "express";
import {
  addUser,
  adminLogin,
  dashboard,
  deleteUser,
  getUsers,
  updateUser,
  verifyUser,
} from "../controllers/adminController.js";
import { createElection, deleteElectionById, endElection, getElections, getResults, previewElectionById, updateElection } from "../controllers/electionController.js";
import { addCandidate, deleteCandidate, getCandidates, updateCandidate } from "../controllers/candidateController.js";

const router = express.Router();
// admin login 
router.post("/adminLogin", adminLogin);

// candidate management
router.post("/addCandidate", addCandidate);
router.get("/getCandidates", getCandidates)
router.patch("/updateCandidate/:candidateId", updateCandidate)
router.delete("/deleteCandidate/:candidateId", deleteCandidate)

// user management
router.get("/getUsers", getUsers);
router.post("/addUser", addUser);
router.patch("/updateUser/:userId", updateUser);
router.delete("/deleteUser/:userId", deleteUser);
router.patch("/verifyUser/:userId", verifyUser);


// election management
router.post("/createElection", createElection)
router.get("/getElections", getElections)
router.patch('/updateElection/:electionId',updateElection)
router.get('/preview/:electionId',previewElectionById)
router.delete('/deleteELection/:electionId',deleteElectionById)

// result
router.patch('/endElection/:electionId',endElection)
router.get('/getResults',getResults)

// dashboard stats
router.get('/dashboard',dashboard)

export default router;
