import mongoose from 'mongoose';

// Aadhaar Verification Schema
const aadhaarVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Link to a User document if required
    ref: 'User',
    required: true,
  },
  proofId: {
    type: String,  // Unique Aadhaar number (masked for security)
    default:function(){return this._id.toString();},
    unique: true
  },
  proofData: {
    a: {
      type: [String],
      required: true,
    },
    b: {
      type: [[String]],  // 2D array of strings
      required: true,
    },
    c: {
      type: [String],
      required: true,
    },
  },
  inputData: {
    type: [String],  // Array of strings for the input data (hexadecimal values)
    required: true,
  },
  result:{
    type: String,
    required: true,
    default:false
  },
  data:{
    Aadhaar: { type: Number, required: true, unique: true },
    Phone: { type: Number, required: true },
    Name: { type: String, required: true },
    Address: { type: String, required: true },
    Age: { type: Number, required: true },
    Dob: { type: Number, required: true },
    fathername: { type: String, required: true }
  


  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  documentUrl: { type: String, default: null },
});

const AadhaarVerification = mongoose.model('AadhaarVerification', aadhaarVerificationSchema);

export default AadhaarVerification;
