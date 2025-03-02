import mongoose from 'mongoose'

const userFingerprintSchema = new mongoose.Schema({
  fingerPrint: {
    type: String,
    unique: true,
    required: true,
  },
  count: {
    type: Number,
    default: 1,
    max: 3
  },
  createdAt: {
    type: Date,
    expires: '7d',
    default: Date.now
  }
})

const UserFingerPrint = mongoose.model("UserFingerPrint",userFingerprintSchema);

export default UserFingerPrint;