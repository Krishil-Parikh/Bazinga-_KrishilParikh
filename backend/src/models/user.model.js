import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    pincode: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: "Mumbai",
    },
    region:  {type: String,
    enum: ["North", "South", "East", "West"], // Role options
    default: "North"},
    moderator: {
      type: String,
      required: true,
    },
    moderator_number: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["hospital", "camp"], // Role options
      default: "moderator", // Default role
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("userAuth1", userSchema);

export default User;
