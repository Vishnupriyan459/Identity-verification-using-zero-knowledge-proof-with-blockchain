import mongoose from 'mongoose';

// PAN Verification Schema
const panVerificationSchema = new mongoose.Schema({
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
    required: true
  },
  data:{
    panNumber: { type: String, required: true, unique: true },
    Phone: { type: Number, required: true },
    name: { type: String, required: true },
    Address: { type: String, required: true },
    Age: { type: Number, required: true },
    Dob: { type: Number, required: true },
    fathername: { type: String, required: true }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  documentUrl: { type: String, default: null },  // Store document URL if uploaded
});

const PanVerification = mongoose.model('PanVerification', panVerificationSchema);

export default PanVerification;
