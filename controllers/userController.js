const User = require("../models/userModel");

// Register a user
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "This is a sample id",
        url: "profilePictureUrl",
      },
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      const message = `Resource not found. Invalid: ${error.path}`;
      res.status(400).json({ success: false, error: message });
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  }
};
