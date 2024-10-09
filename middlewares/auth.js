const jwt = require("jsonwebtoken");
const prisma = require("../utills/prismaClient");
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwtTask;
    if (!token) return res.status(409).json({ error: "you must login" });
    const decode = jwt.decode(token, process.env.SECRET_JWT);
    req.userId = decode.userId;
    req.userEmail = decode.userEmail;
    // check user found
    const findUser = await prisma.user.findUnique({
      where: {
        id: decode.userId,
      },
    });
    if (!findUser) return res.status(404).json({ error: "user not found" });
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = auth;
