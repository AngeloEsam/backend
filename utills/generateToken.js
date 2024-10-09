const jwt = require("jsonwebtoken");
require("dotenv").config();
const generateToken = ({ userId, userEmail }, res) => {
  const token = jwt.sign(
    { userId: userId, userEmail: userEmail },
    process.env.SECRET_JWT,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("jwtTask", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
};
module.exports = { generateToken };
