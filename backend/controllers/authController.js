const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
      if (!name || !email || !password) {
          return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
      }

      let user = await User.findOne({ email });

      if (user) {
          return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // FIX: Create the user with the plain password.
      // The hashing is now handled ONLY by the pre-save hook in User.js
      user = new User({ name, email, password });
      
      // REMOVED these lines:
      // const salt = await bcrypt.genSalt(10);
      // user.password = await bcrypt.hash(password, salt);

      await user.save();
      
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
          if (err) throw err;
          res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
      });

  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};