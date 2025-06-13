import crypto from 'crypto'; // For ES modules    
function hashToNumeric(input) {
    // Create a SHA-256 hash as a Buffer
    const bufferHash = crypto.createHash('sha256').update(input).digest();

    // Convert the Buffer to a numeric string (big integer)
    const numericHash = BigInt('0x' + bufferHash.toString('hex')).toString();

    return numericHash;
}

export function hashSensitiveInputs(req, res, next) {
    try {
      const { name, address,fathername } = req.body;
  
      if (name) {
        // Hash the name using SHA-256
        req.body.nameHash = hashToNumeric(name)

      }
  
      if (address) {
        // Hash the address using SHA-256
        req.body.addressHash = hashToNumeric(address)
      }
      if(fathername){
        req.body.fathername=hashToNumeric(fathername)
      }
      
  
      // Continue to the next middleware/handler
      next();
    } catch (error) {
      res.status(400).send({ message: 'Error hashing sensitive data', error: error.message });
    }
  }