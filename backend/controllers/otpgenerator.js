import express from 'express'; // Add express import
import admin from 'firebase-admin';
// const admin = require('../firebase-config');
import XLSX from 'xlsx';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path'; // For handling file paths
import serviceAccount from "../Config/go.json" assert { type: "json" };
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const otpService = () => {
  const app = express();
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  app.use(bodyParser.json());
  // app.use(
  //   session({
  //     secret: 'secretKey',
  //     resave: false,
  //     saveUninitialized: true,
  //     cookie: { secure: false },
  //   })
  // );

  // Load the Excel file
  const excelFilePath = path.join(__dirname, '../controllers/excell.xlsx');
  const workbook = XLSX.readFile(excelFilePath); // Initialize the workbook here
  const sheet_name = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name]);
  
  const aadhaarMap = {};
  data.forEach((row) => {
    aadhaarMap[row.Aadhaar] = row.Phone;
  });

  // Generate OTP route
  app.post("/generate-otp", async (req, res) => {
    const { aadhaar } = req.body;
    const phoneNumber = aadhaarMap[aadhaar];
    
    if (!phoneNumber) return res.status(400).json({ error: "Invalid Aadhaar number" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = otp;
    req.session.phone = phoneNumber;

    try {
      // Create a Firebase user
      await admin.auth().createUser({ uid: phoneNumber, phoneNumber: "+91" + phoneNumber });
    } catch (error) {
      console.error('Error creating user in Firebase:', error);
    }

    res.json({ message: "OTP sent successfully", otp });
  });

  // Verify OTP route
  app.post("/verify-otp", (req, res) => {
    const { otp } = req.body;
    if (req.session.otp === otp) {
      res.json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ error: "Invalid OTP" });
    }
  });

};

export default otpService;
