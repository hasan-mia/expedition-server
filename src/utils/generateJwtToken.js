const jwt = require("jsonwebtoken");
const { JWT_EXPIRE, JWT_SECRET } = require("../config/constant");

const sendToken = (data, statusCode, res) => {
  const token = jwt.sign(data, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });

  res.status(statusCode).json({ success: true, data, token });
};

module.exports = sendToken;
