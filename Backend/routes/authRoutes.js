import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js'; // Import controller functions

const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);

export default router;
