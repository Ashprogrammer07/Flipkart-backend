const mongoose = require("mongoose");
const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

const JWT_SECRET = 'your_jwt_secret'; // Make sure to move this to .env in production

// Mongoose User model
const User = mongoose.model(
  "User",
  new mongoose.Schema({ email: String, password: String })
);

// Signup route
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  const exuser = await User.findOne({ email });
  
  if (exuser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedpwd = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedpwd });

  await user.save(); // ❗ fixed: was "User.save()" which is wrong

  const token = jsonwebtoken.sign({ UserID: user._id }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).json({ token });
});

// Login route
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = jsonwebtoken.sign({ UserID: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } else {
    res.status(400).json({ error: "Invalid Credentials!" });
  }
});

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jsonwebtoken.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
}

module.exports = { router, authenticateJWT }; // ❗ fixed: was "module.export"
