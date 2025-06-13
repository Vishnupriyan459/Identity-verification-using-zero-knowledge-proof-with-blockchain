import express from 'express';
import { checkAadhaar } from '../controllers/AadhaarProofChecker.js'; 
import {checkPan} from '../controllers/PanProofChecker.js'// Add .js extension

const router = express.Router();

router.get('/Aadhaar', checkAadhaar);
router.get('/Pan',checkPan);

export default router;