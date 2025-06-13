import express from 'express';
import { registerUser,loginUser } from '../controllers/userController.js'; // Add .js extension
import AadhaarVerification from '../models/AadhaarProof.js';
import PanVerification from '../models/PanProof.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',loginUser);
router.get('/status/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      console.log(userId);
      
      const aadhaar = await AadhaarVerification.findOne({ userId });
      const pan = await PanVerification.findOne({ userId });
  
      res.json({
        aadhaar: aadhaar
          ? { proofId: aadhaar._id, result: aadhaar.result }
          : null,
        pan: pan
          ? { proofId: pan._id, result: pan.result }
          : null,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching status", error });
    }
  });
export default router; // Use default export
