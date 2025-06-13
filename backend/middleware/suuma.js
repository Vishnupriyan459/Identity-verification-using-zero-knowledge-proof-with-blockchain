import { log } from 'console';
import crypto from 'crypto';

function hashToNumeric(input) {
    // Create a SHA-256 hash as a Buffer
    const bufferHash = crypto.createHash('sha256').update(input).digest();

    // Convert the Buffer to a numeric string (big integer)
    const numericHash = BigInt('0x' + bufferHash.toString('hex')).toString();

    return numericHash;
}

// Example usage
const name = "John Doe";
const address = "123 Main St, City";
const hashedName = hashToNumeric(name);
const hashednamer=hashToNumeric(name);
const fathernamer=hashToNumeric("elumalai");
if(hashedName&&hashednamer){
    console.log("marala mavane");
    
}
console.log();

const hashedAddress = hashToNumeric(address);

console.log(`Numeric Hashed Name: ${hashedName} \nNumeric Hashed Address: ${hashedAddress}\n Numberic hashed father name ${fathernamer}`);
