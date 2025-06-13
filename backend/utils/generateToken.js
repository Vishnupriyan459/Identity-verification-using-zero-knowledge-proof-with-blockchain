import jwt from 'jsonwebtoken';

function generateToken(user) {
  const payload = { id: user._id, email: user.email };  // Use user data for the payload
  const secretKey = process.env.JWT_SECRET;  // Your JWT secret key from the environment
  const expiresIn = process.env.JWT_EXPIRE || '1h';  // Expiry time from environment or default to 1 hour
  
  
  // Sign the token and return it
  return jwt.sign(payload, secretKey, { expiresIn });
}


export default generateToken
