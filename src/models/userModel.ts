import { Model, Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import IUser from '../utils/interfaces/user.interface';

const userSchema = new Schema<IUser, Model<IUser>>({
  name: {
    type: String,
    required: [true, 'Please tell us you name'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm you password'],
    validate: {
      // This only works only on create or save!!
      validator: function (el: string) {
        return el === (this as unknown as IUser).password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Hash the password before save
userSchema.pre('save', async function (this, next) {
  // Exit this function if password wasn't modified
  if (!this.isModified('password')) return next();
  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password!, 12);
  // Delete passowrdConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Check if the password is correct
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export default model<IUser>('User', userSchema);
