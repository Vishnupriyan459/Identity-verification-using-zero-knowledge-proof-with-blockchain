import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AadhaarVerification from '../models/AadhaarProof.js';

import generateToken from '../utils/generateToken.js';
import PanVerification from '../models/PanProof.js';

export const registerUser = async (req, res) => {
  const { phoneNumber, name, email, password } = req.body;
  console.log(req.body);

  try {
    // ✅ Check if user already exists
    let user = await User.findOne({ email });
    // console.log(user);
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create new user
    user = new User({
      phoneNumber,
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // ✅ Generate token
    const userId=user._id
    const token = generateToken(userId);
      // ✅ Send response with token and user name
    res.status(200).json({
      message: 'User registered successfully',
      token,
      account: { name: user.name }  // Return only the user's name
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: error.message || 'Failed to register user' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, phoneNumber } = req.body;

  try {
    let user;

    // ✅ Find user by email or phone number
    if (email) {
      user = await User.findOne({ email });
    } else if (phoneNumber) {
      user = await User.findOne({ phoneNumber });
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // ✅ Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // ✅ Generate token
    const token = generateToken(user);
    
    const account= await User.find().select("name").exec()

    res.status(200).json({
      message: 'Login successful',
      token,
      account
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

