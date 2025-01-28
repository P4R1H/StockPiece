import mongoose from 'mongoose';
import argon from 'argon2'

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: [true, "username already exists"],
    lowercase: true,
    trim: true,
    minLength: [3, "username should be minimum 3 characters"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [6, "password should be minimum 6 characters"],
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  }
},{timestamps: true})

adminSchema.pre('save',async function(next) {
  try {
    const admin = this;

    if (!admin.isModified(['password'])) {
      return next();
    }

    const hash = await argon.hash(admin.password);
    admin.password = hash;
  } catch (error) {
    next(error);
  }
})

adminSchema.methods.validatePassword = async function (password) {
  return argon.verify(password,this.password);
}

userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      isSuperAdmin: this.isSuperAdmin
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  return token;
};

const Admin = mongoose.model('Admin',adminSchema);

export default Admin;