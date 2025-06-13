import Web3 from 'web3';
import { initialize } from 'zokrates-js';
import fs from 'fs';
import PanContractConfig from '../Contract/PanContractConfig.json' assert { type: 'json' };
import PanVerification from '../models/PanProof.js';
import{getAadhaarDetails, getPanDetails }from './Datauploader.js';
import { log } from 'console';
// Connect to Ganache
const web3 = new Web3('http://localhost:7545');

// Verifier Contract ABI and Address (replace with your deployed address)
const verifierABI = PanContractConfig.abi;
const verifierAddress = PanContractConfig.ContractAddress; // Replace with deployed contract address
const verifierContract = new web3.eth.Contract(verifierABI, verifierAddress);

const panZokPath = 'Zokartes/pan.zok';


async function verifyTx(verifyTxPromise,result) {
  try {
    const receipt = await verifyTxPromise; // Ensure it's awaited
    console.log('Transaction Receipt:', receipt);

    const isSuccess = receipt.status === true || receipt.status === 1n; // Fix BigInt issue
    const statusMessage=isSuccess ? "Transaction was successful!" : "Transaction failed.";
    console.log(statusMessage,result);
    return { 
        message: statusMessage,
        result
    };
  } catch (error) {
    console.error('Error during transaction verification:', error);
    return { 
        message: 'Error during verification process', 
        error: error.message 
    };  // Return false in case of an error
  }
}

function processPanVerification(results) {
    // Step 1: Remove unwanted characters (newlines and extra spaces)
    const cleanedString = results.replace(/\s+/g, ' ').trim();

    // Step 2: Parse the cleaned string into a proper array
    const parsedResults = JSON.parse(cleanedString);

    const fields = [
        "OverallResult",
        "Pan Number",
        "Pan Name",
        "Father Name",
        "Date of Birth",
        
    ];

    // Step 3: Map the parsed results to "success" or "failed"
    const mappedResults = parsedResults.map(res => {
        if ( res === "1") {
            return "success";
        } 
        else if(res === true ){
            return true;
        }else {
            return "failed";
        }
    });

    // Step 4: Combine fields and mapped results into an object
    const combined = fields.reduce((acc, field, index) => {
        acc[field] = mappedResults[index];
        return acc;
    }, {});
    console.log("ZKP verification of Aadhaar:");
    console.log(combined);
    return combined;
}
async function datastore(proofData,input,user,result,data){
  // const status = result === "true" ? "verified" : "cancelled";
  const PanData={
      proofData:proofData,
      inputData:input,
      userId:user,
      result:result,
      data:data
  }
  try {
      // First, check if the document already exists
      const existingDocument = await PanVerification.findOne({ userId: user });
          console.log(existingDocument);
          
      if (existingDocument) {
          // Update the existing document
          existingDocument.proofData = proofData;
          existingDocument.inputData = input;
          existingDocument.result=result;
          existingDocument.data=data;
          
          // Save the updated document
          const updatedDocument = await existingDocument.save();
          console.log('Pan Verification updated successfully:', updatedDocument);
          return updatedDocument;
      } else {
          // Create a new document if it doesn't exist
          const newpanProof = new PanVerification(PanData);
          const savedDocument = await newpanProof.save();
          console.log('Pan Verification created successfully:', savedDocument);
          return savedDocument;
      }
  } catch (err) {
      console.error('Error updating Pan verification:', err);
      throw new Error('Failed to update Pan verification');
  }
}
async function runPanVerification(inputs,user){
  try{
    // const datar=getPanDetails(inputs[0]);
    const data=getPanDetails(inputs[0]);

    
  //   const data={
  //     "panNumber":"ABCDE1234F",
  //     "name":"John Doe",
  //     "fathername":"vikaz",
  //     "dob":"19900101"
  // }
    // console.log(data);
    
    const accounts=await web3.eth.getAccounts();
    const sender=accounts[1];
    const zokratesProvider=await initialize();
    const source=fs.readFileSync(panZokPath,'utf8');

    const artifacts=zokratesProvider.compile(source);
    // [
    //   '12', '12', '1234', '1234', '12122003', '12122003',
    // ]
    // ['ABCDE1234F','ABCDE1234F',
    //     '49263835568790852285136755540501101044952629041170102772579963724714827315464', '49263835568790852285136755540501101044952629041170102772579963724714827315464', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '12122003', '12122003',
    //   ]

    const { witness, output } = zokratesProvider.computeWitness(artifacts, inputs);
   
    const result=processPanVerification(output)
    // Setup
    const keypair = zokratesProvider.setup(artifacts.program);

    // Proof Generation
    const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);
    console.log(proof);

    // Verify Proof Off-Chain
    const isVerified = zokratesProvider.verify(keypair.vk, proof);
    console.log('Off-chain verification:', isVerified);

    // Extract Proof Data for Solidity
    const proofData = {
      a: proof.proof.a,
      b: proof.proof.b,
      c: proof.proof.c,
    };
    const input = proof.inputs;
    console.log('Proof Data:', proofData,'input:',input);
    datastore(proofData,input,user,result.OverallResult,data)

    // Interact with Verifier Contract in Solidity
    const receipt = await verifierContract.methods
      .verifyTx(proofData, input)
      .send({ from: sender, gas: 3000000 });

    console.log('On-chain verification transaction receipt:', receipt);
    return verifyTx(receipt,result); // Ensure it's awaited


  }
  catch(error){
    console.error("Error in main():",error);
    return false
  }
}

export default runPanVerification;