const crypto = require('crypto');

// Hash the name
const name = 'John Doe';
const nameHash = crypto.createHash('sha256').update(name).digest('hex');

// Hash the address
const address = '123 Main St, City';
const addressHash = crypto.createHash('sha256').update(address).digest('hex');

// Send the hashes to the backend
const dataToSend = {
  nameHash: nameHash,
  addressHash: addressHash
};
