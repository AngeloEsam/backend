const { generateToken } = require("../utills/generateToken");
const prisma = require("../utills/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/*****************************************
 * @desc            function register
 * @routes          api/user/register
 * @method          POST
 * @access          public
 *****************************************/
const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // validation
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ error: "you must enter name, email, password" });
    // check email found
    const findEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (findEmail)
      return res.status(409).json({ error: "email already exist" });
    // bcrtpt password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // create email
    const createEmail = await prisma.user.create({
      data: { name: name, email: email, password: hashPassword },
    });
    // generate token
    generateToken(
      { userId: createEmail.id, userEmail: createEmail.email },
      res
    );
    const { password: _, ...userData } = createEmail;
    return res.status(201).json({
      message: "register successfully",
      data: userData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function login
 * @routes          api/user/login
 * @method          POST
 * @access          public
 *****************************************/
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // validation
    if (!email || !password)
      return res.status(400).json({ error: "email and password is required" });
    // check email and password
    const findEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!findEmail) return res.status(401).json({ error: "email not found" });

    const verifyPassword = await bcrypt.compare(password, findEmail.password);
    if (!verifyPassword)
      return res.status(401).json({ error: "password is wrong" });

    // login
    generateToken({ userId: findEmail.id, userEmail: findEmail.email }, res);
    const { password: _, ...userData } = findEmail;
    return res
      .status(200)
      .json({ message: "login successfully", data: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function updateUser
 * @routes          api/user
 * @method          PUT
 * @access          private
 *****************************************/
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  try {
    // check email
    if (email && email !== req.userEmail) {
      const findEmail = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
      if (findEmail)
        return res.status(409).json({ error: "this email already exist" });
    }
    // update
    const newUser = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        email,
        name,
      },
    });
    const { password: _, ...userData } = newUser;
    return res
      .status(200)
      .json({ message: "user updated successfully", data: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function updatePassword
 * @routes          api/user/update_password
 * @method          PUT
 * @access          private
 *****************************************/
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    // validation
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "old password and new password is required" });
    // check found user
    const findUser = await prisma.user.findUnique({
      where: {
        id: parseInt(req.userId),
      },
    });
    if (!findUser) return res.status(400).json({ error: "user not found" });
    // check compare password
    const comparePassword = await bcrypt.compare(
      oldPassword,
      findUser.password
    );
    if (!comparePassword)
      return res.status(409).json({ error: "old password is wrong" });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        password: hashPassword,
      },
    });
    return res.status(200).json({ message: "update password successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function logout
 * @routes          api/user/logout
 * @method          POST
 * @access          public
 *****************************************/
const logout = async (req, res) => {
  try {
    res.cookie("jwtTask", "", {
      maxAge: 0,
      httpOnly: true,
    });
    return res.status(200).json({ message: "user logout successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/*****************************************
 * @desc            function checkExpireToken
 * @routes          api/user/checkExpireToken
 * @method          get
 * @access          public
 *****************************************/
const checkExpireToken = (req, res) => {
  try {
    const token = req.cookies?.jwtTask;
    if (!token) return res.status(401).json({ error: "token not found" });
    jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
      if (err) {
        res.clearCookie("jwtTask");
        return res.status(401).json({ error: "token expired or invalid" });
      }
      return res.status(200).json({ message: "token is valid" });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
module.exports = {
  register,
  login,
  updateUser,
  updatePassword,
  checkExpireToken,
  logout,
};
