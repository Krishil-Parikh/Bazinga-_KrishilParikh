import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const generateToken = (userID, role, res) => {
  const token = jwt.sign({ userID, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure:  "true"
  })

  return token;
};

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = decoded.userID;
    console.log(req.userID);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

