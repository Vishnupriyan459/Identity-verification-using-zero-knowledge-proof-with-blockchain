import Web3 from 'web3';
import { initialize } from 'zokrates-js';
import fs from 'fs';
import AadhaarContractConfig from '../Contract/AadhaarContractConfig.json' assert { type: 'json' };
import AadhaarVerification from '../models/AadhaarProof.js';
import{getAadhaarDetails}from './Datauploader.js';
import { log } from 'console';

// Connect to Ganache
const web3 = new Web3('http://localhost:7545');

// Verifier Contract ABI and Address (replace with your deployed address)
const verifierABI = AadhaarContractConfig.abi;
const verifierAddress = AadhaarContractConfig.ContractAddress; // Replace with deployed contract address
const verifierContract = new web3.eth.Contract(verifierABI, verifierAddress);

const aadhaarZokPath = 'Zokartes/aadhaar.zok';

async function verifyTx(verifyTxPromise, result) {
    try {
        const receipt = await verifyTxPromise;

        // Check if the transaction status is 1 (successful) or 0 (failed)
        const isSuccess =  result.OverallResult!=="failed";

        console.log('Onchain Transaction Success:', isSuccess);
        

        const statusMessage = isSuccess ? 'AadhaarVerification successful' : 'AadhaarVerification failed';
        
        return { 
            message: statusMessage,
            onchain_verifaction:isSuccess,
            offchain_verifaction:isSuccess,
            result
        };
    } catch (error) {
        console.error('Error during transaction verification:', error);
        return { 
            message: 'Error during verification process', 
            error: error.message 
        }; 
    }
}

function processAadhaarVerification(results) {
    // Step 1: Remove unwanted characters (newlines and extra spaces)
    const cleanedString = results.replace(/\s+/g, ' ').trim();

    // Step 2: Parse the cleaned string into a proper array
    const parsedResults = JSON.parse(cleanedString);

    const fields = [
        "OverallResult",
        "Aadhaar Number",
        "Aadhaar Name",
        "Father Name",
        "Date of Birth",
        "Age",
        "Address"
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

async function datastore(proofData, input, user, result,data) {
    // Determine status based on result
    
    const AadhaarData = {
        proofData: proofData,
        inputData: input,
        userId: user,
        result: result,
        data:data
       
    };

    try {
        // First, check if the document already exists
        const existingDocument = await AadhaarVerification.findOne({ userId: user });

        if (existingDocument) {
            // Update the existing document
            existingDocument.proofData = proofData;
            existingDocument.inputData = input;
            existingDocument.result = result;
            existingDocument.data=data;
             

            // Save the updated document
            const updatedDocument = await existingDocument.save();
            console.log('Aadhaar Verification updated successfully:', updatedDocument);
            return updatedDocument;
        } else {
            // Create a new document if it doesn't exist
            const newAadhaarProof = new AadhaarVerification(AadhaarData);
            const savedDocument = await newAadhaarProof.save();
            console.log('Aadhaar Verification created successfully:', savedDocument);
            return savedDocument;
        }
    } catch (err) {
        console.error('Error updating Aadhaar verification:', err);
        throw new Error('Failed to update Aadhaar verification');
    }
}




async function runVerification(inputs,user) {
    try {
        
        const data=getAadhaarDetails(inputs[0])
        
        
        
        const accounts = await web3.eth.getAccounts();
        const sender = accounts[1]; // Use the first account for transactions

        const zokratesProvider = await initialize();

        // Load ZoKrates source
        const source = fs.readFileSync(aadhaarZokPath, 'utf8');

        // Compilation
        const artifacts = zokratesProvider.compile(source);

        // Computation (witness and public inputs)
        const { witness, output } = zokratesProvider.computeWitness(artifacts, inputs);
        
        

        const result=processAadhaarVerification(output)


        
        // Setup
        const keypair = zokratesProvider.setup(artifacts.program);

        // Proof Generation
        const proof = zokratesProvider.generateProof(artifacts.program, witness, keypair.pk);

        // Verify Proof Off-Chain
        const isVerified = zokratesProvider.verify(keypair.vk, proof);
        

        if (!isVerified) {
            throw new Error('Off-chain verification failed.');
        }else{
            console.log("Off-chain verification success.")
        }

        // Extract Proof Data for Solidity
        const proofData = {
            a: proof.proof.a,
            b: proof.proof.b,
            c: proof.proof.c,
        };
        const input = proof.inputs;

        // console.log('Proof Data:', proofData,'input data:',input);//to store in mongodb
        
        
        datastore(proofData,input,user,result.OverallResult,data);
        // Interact with Verifier Contract in Solidity
        const receipt = await verifierContract.methods
            .verifyTx(proofData, input)
            .send({ from: sender, gas: 3000000 });

        console.log('On-chain verification transaction receipt:', receipt);

        return verifyTx(receipt,result);
    } catch (error) {
        console.error('Error during verification process:', error);
        return false;
    }
}

export default runVerification;
