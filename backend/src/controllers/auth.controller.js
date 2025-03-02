import { generateToken } from "../utils/utils.js";
import User from "../models/user.model.js";


export const signup = async (req, res) => {
  const {
    email,
    password,
    pincode,
    city,
    moderator,
    moderator_number,
    role
  } = req.body;

  try {
    if (
      !email ||
      !password ||
      !pincode ||
      !city ||
      !moderator ||
      !moderator_number ||
      !role
    ) {
      return res.status(400).json({ message: "All fields are required:/" });
    }

    if (password.length < 6) {
      return res 
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Acc with this email already exists" });
    }

    

    const newUser = new User({
      email,
      password,
      pincode,
      city: city || "Mumbai",
      moderator,
      moderator_number,
      role
    });
    

    if (newUser) {
      generateToken(newUser._id, newUser.role, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        pincode: newUser.pincode,
        city: newUser.city,
        moderator: newUser.moderator,
        moderator_number: newUser.moderator_number,
        role: newUser.role,
      });
    } else {
      res.status(400).json({ message: "Invalid camp data" });
    }
  } catch (error) {
    console.log("Error in camp signup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
   
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    if (password!=user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    else
    {
      console.log("login successful!");
    }
    generateToken(user._id, user.role, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role, 
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out succesfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};
