import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


export default model('User', UserSchema); // Use export default
