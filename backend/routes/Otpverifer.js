import express from "express";
import XLSX from 'xlsx';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import admin from 'firebase-admin';  // Import Firebase Admin SDK

const router = express.Router();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Ensure you've initialized your Firebase credentials properly
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Route to get the phone number based on Aadhaar number and send OTP
router.post("/Aadhaar/Phonegetter", async (req, res) => {
  const { adhaarnumber } = req.body; // Aadhaar number from the request body
  
  if (!adhaarnumber) {
    return res.status(400).send({ error: "Aadhaar number is required" });
  }

  try {
    // Load the Excel file
    const excelFilePath = path.join(__dirname, 'excell.xlsx');
    const workbook = XLSX.readFile(excelFilePath); // Initialize the workbook
    const sheetName = workbook.SheetNames[1]; // Get the first sheet name
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

    // Create a map for Aadhaar to Phone mapping
    const aadhaarMap = {};
    data.forEach((row) => {
      aadhaarMap[row.Aadhaar] = row.Phone;
    });

    // Lookup the phone number using the Aadhaar number
    const phoneNumber = aadhaarMap[adhaarnumber];
    if(phoneNumber===undefined){
      res.send({data:false})
    }else{
    res.send({phoneNumber})
  }
  } catch (error) {
    console.error("Error reading Excel file:", error);
    res.status(500).send({ error: "An error occurred while reading the Excel file" });
  }
});
router.post("/Pancard/Phonegetter", async (req, res) => {
  const { panNumber } = req.body; // Aadhaar number from the request body
  
  if (!panNumber) {
    return res.status(400).send({ error: "Aadhaar number is required" });
  }

  try {
    // Load the Excel file
    const excelFilePath = path.join(__dirname, 'excell.xlsx');
    const workbook = XLSX.readFile(excelFilePath); // Initialize the workbook
    const sheetName = workbook.SheetNames[2]; // Get the first sheet name
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

    // Create a map for Aadhaar to Phone mapping
    const panNumberMap = {};
    data.forEach((row) => {
      panNumberMap[row.panNumber] = row.Phone;
    });

    // Lookup the phone number using the Aadhaar number
    const phoneNumber = panNumberMap[panNumber];
    res.send({phoneNumber})
    
  } catch (error) {
    console.error("Error reading Excel file:", error);
    res.status(500).send({ error: "An error occurred while reading the Excel file" });
  }
});
// Route to send OTP (Initiate OTP request)
// router.post('/sendOTP', async (req, res) => {
//   const { phoneNumber } = req.body;

//   // Optional: Validation of phone number format
//   if (!phoneNumber) {
//     return res.status(400).send({ error: 'Phone number is required' });
//   }

//   try {
//     // Firebase Authentication manages sending OTP automatically
//     const recaptchaVerifier = new admin.auth.RecaptchaVerifier('recaptcha-container', {
//       size: 'invisible',
//       callback: function (response) {
//         console.log('Recaptcha response:', response);
//       },
//     });

//     // The actual OTP sending should happen on the client-side via Firebase Client SDK.
//     res.status(200).send({
//       message: 'OTP sent successfully via Firebase Authentication (client-side)',
//     });
//   } catch (error) {
//     console.log('Error sending OTP:', error);
//     return res.status(500).send({ error: 'Failed to send OTP' });
//   }
// });
  //routes/Otpverifer.js
  router.post('/sendOTP', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).send({ error: 'Phone number is required' });
    }
    //The client side code will make the firebase call to send the OTP.
    res.status(200).send({message:"OTP request received"});
});

export default router;
