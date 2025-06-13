import express from "express";
import runVerification from "./controllers/Aadhaarverifier.js";
import runPanVerification from"./controllers/Panverifier.js";
import  connectDB from './Config/db.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import CheckRoutes from './routes/CheckRoutes.js'
import Otpverifer from './routes/Otpverifer.js'
import dotenv from 'dotenv';
import AuthMiddleware from './middleware/AuthMiddleware.js';

// Load environment variables
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());
const port = process.env.PORT ||3000;
// import
import { hashSensitiveInputs } from "./middleware/Hashing.js"; // Ensure file extensions for imports in ESM
import { getAadhaarDetails, getPanDetails } from "./controllers/Dataconvetor.js";
connectDB();


app.use(express.json());
app.use('/api/users', userRoutes);
// getAadhaarDetails()
app.use('/api',Otpverifer);
app.use('/proof/check',AuthMiddleware,CheckRoutes)
// app.post("/proof/generateAadhaar",AuthMiddleware ,hashSensitiveInputs, async (req, res) => {
//   const { aadhaarNumber, nameHash, dob, age, addressHash,fathername } = req.body;

//   try {
//     // const inputs = [
//     //     BigInt(aadhaarNumber).toString(),
//     //     BigInt(123456789012).toString(),
//     //     BigInt(nameHash).toString(),
//     //     BigInt(49263835568790852285136755540501101044952629041170102772579963724714827315464).toString(),
//     //     BigInt(dob).toString(),
//     //     BigInt(19900101).toString(),
//     //     BigInt(age).toString(),
//     //     BigInt(30).toString(),
//     //     BigInt(addressHash).toString(),
//     //     BigInt(39202355866493996478938002602198439353433168551890330388544620641933385911741).toString()
//     //   ];
//     const inputs = [
//       BigInt(aadhaarNumber).toString(),
//       BigInt(123456789012).toString(),
//       `${nameHash}`,
//       "49263835568790852285136755540501101044952629041170102772579963724714827315464",
//        `${fathername}`, '112723167755042256152586991583804267031316545700986800499472219647139434903606',
//       BigInt(dob).toString(),
//       BigInt(19900101).toString(),
//       BigInt(age).toString(),
//       BigInt(30).toString(),
//       `${addressHash}`,
//       // addressHash
//       "39202355866493996478938002602198439353433168551890330388544620641933385911741",
//     ];
//     // const inputs = [
//     //   BigInt(aadhaarNumber).toString(),
//     //   BigInt(aadhaarNumber).toString(),
//     //   `${nameHash}`,
//     //   `${nameHash}`,
//     //    `${fathername}`, `${fathername}`,
//     //   BigInt(dob).toString(),
//     //   BigInt(dob).toString(),
//     //   BigInt(age).toString(),
//     //   BigInt(age).toString(),
//     //   `${addressHash}`,
//     //   // addressHash
//     //   `${addressHash}`,
//     // ];
    
    
//     const verified = await runVerification(inputs,req.user.id);
//     if (verified) {
//       res.status(200).send(verified); // send both message and result
//     } else {
//       res.status(400).send({ message: "Aadhaar verification failed." });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .send({
//         message: "Error processing Aadhaar verification.",
//         error: error,
//       });
//   }
// });
// app.post("/proof/generatePancard",AuthMiddleware,hashSensitiveInputs, async (req, res) => {
//   const { panNumber, nameHash, dob, fathername } = req.body;
  

//   try {
    
//     // const inputs=['ABCDE1234F','ABCDE1234F',
//     //   '49263835568790852285136755540501101044952629041170102772579963724714827315464', '49263835568790852285136755540501101044952629041170102772579963724714827315464', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '12122003', '12122003',
//     // ]
//     const inputs=['ABCDE1234F',`${panNumber}`,
//       `${nameHash}`, '49263835568790852285136755540501101044952629041170102772579963724714827315464', `${fathername}`, '112723167755042256152586991583804267031316545700986800499472219647139434903606', `${dob}`, '12122003',
//     ] 
//     // const inputs = [
//     //   BigInt(panNumber).toString(),
//     //   BigInt(ABCDE1234F).toString(),
//     //   `${nameHash}`,
//     //   "49263835568790852285136755540501101044952629041170102772579963724714827315464",
      
//     //   `${fathername}`,
      
//     //   "112723167755042256152586991583804267031316545700986800499472219647139434903606",
//     //   BigInt(dob).toString(),
//     //   BigInt(12122003).toString()
//     // ];
//     // const inputs=[`${panNumber}`,`${panNumber}`,
//     //   `${nameHash}`, `${nameHash}`, `${dob}`, `${dob}`,
//     // ]
    
    
//     const verified = await runPanVerification(inputs,req.user.id);

//     if (verified) {
//       res.status(200).send(verified); // send both message and result
//     } else {
//       res.status(400).send({ message: "Aadhaar verification failed." });
//     }
//   } catch (error) {
//     res
//       .status(500)
//       .send({
//         message: "Error processing Pancard verification.",
//         error: error,
//       });
//   }
// });

app.post("/proof/generateAadhaar",AuthMiddleware ,hashSensitiveInputs, async (req, res) => {
  const { aadhaarNumber, nameHash, dob, age, addressHash,fathername } = req.body;

  try {
    const card=getAadhaarDetails(aadhaarNumber)
    
    
    const inputs = [
      BigInt(aadhaarNumber).toString(),
      BigInt(card.Aadhaar).toString(),
      `${nameHash}`,
      `${card.NameHash}`,
       `${fathername}`, `${card.FatherHash}`,
      BigInt(dob).toString(),
      BigInt(card.Dob).toString(),
      BigInt(age).toString(),
      BigInt(card.Age).toString(),
      `${addressHash}`,
      // addressHash
      `${card.AddressHash}`,
    ];
    
    console.log(inputs);
    
    
    const verified = await runVerification(inputs,req.user.id);
    if (verified) {
      res.status(200).send(verified); // send both message and result
    } else {
      res.status(400).send({ message: "Aadhaar verification failed." });
    }
  } catch (error) {
    res
      .status(500)
      .send({
        message: "Error processing Aadhaar verification.",
        error: error,
      });
  }
});
app.post("/proof/generatePancard",AuthMiddleware,hashSensitiveInputs, async (req, res) => {
  const { panNumber, nameHash, dob, fathername } = req.body;
  

  try {
    
   
    const card=getPanDetails(panNumber);


    const inputs=[`${panNumber}`,`${card.PAN}`,
      `${nameHash}`, `${card.NameHash}`, `${fathername}`, `${card.FatherHash}`, `${dob}`, `${card.DOB}`,
    ] 
    console.log(inputs);
    
    
    
    
    const verified = await runPanVerification(inputs,req.user.id);

    if (verified) {
      res.status(200).send(verified); // send both message and result
    } else {
      res.status(400).send({ message: "Aadhaar verification failed." });
    }
  } catch (error) {
    res
      .status(500)
      .send({
        message: "Error processing Pancard verification.",
        error: error,
      });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
