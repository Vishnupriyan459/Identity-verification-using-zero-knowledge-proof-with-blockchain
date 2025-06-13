import Web3 from 'web3';
import { initialize } from 'zokrates-js';
import fs from 'fs';
import PanContractConfig from './Contract/PanContractConfig.json' assert { type: 'json' };

// Connect to Ganache
const web3 = new Web3('http://localhost:7545');

// Verifier Contract ABI and Address (replace with your deployed address)
const verifierABI = PanContractConfig.abi;
const verifierAddress = PanContractConfig.ContractAddress; // Replace with deployed contract address
const verifierContract = new web3.eth.Contract(verifierABI, verifierAddress);

const panZokPath = 'Zokartes/pan.zok';

async function verifyTx(verifyTxPromise) {
  try {
    const receipt = await verifyTxPromise; // Ensure it's awaited
    console.log('Transaction Receipt:', receipt);

    const isSuccess = receipt.status === true || receipt.status === 1n; // Fix BigInt issue

    console.log(isSuccess ? "Transaction was successful!" : "Transaction failed.");
    return isSuccess;
  } catch (error) {
    console.error('Error during transaction verification:', error);
    return false; // Return false in case of an error
  }
}


async function main(){
  try{
    const accounts=await web3.eth.getAccounts();
    const sender=accounts[1];
    const zokratesProvider=await initialize();
    const source=fs.readFileSync(panZokPath,'utf8');

    const artifacts=zokratesProvider.compile(source);
    // [
    //   '12', '12', '1234', '1234', '12122003', '12122003',
    // ]

    const { witness, output } = zokratesProvider.computeWitness(artifacts, ['ABCDE1234F','ABCDE1234F',
      '49263835568790852285136755540501101044952629041170102772579963724714827315464', '49263835568790852285136755540501101044952629041170102772579963724714827315464', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '39202355866493996478938002602198439353433168551890330388544620641933385911741', '12122003', '12122003',
    ]);
    console.log(output);
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
    console.log('Proof Data:', proofData);

    // Interact with Verifier Contract in Solidity
    const receipt = await verifierContract.methods
      .verifyTx(proofData, input)
      .send({ from: sender, gas: 3000000 });

    console.log('On-chain verification transaction receipt:', receipt);
    await verifyTx(receipt); // Ensure it's awaited


  }
  catch(error){
    console.error("Error in main():",error);
  }
}

main()