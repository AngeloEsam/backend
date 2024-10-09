const express = require("express");
const {
  register,
  login,
  logout,
  updateUser,
  updatePassword,
  checkExpireToken,
} = require("../controller/userController");
const auth = require("../middlewares/auth");
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/", auth, updateUser);
router.put("/update_password", auth, updatePassword);
router.get("/logout", logout);
router.get("/checkExpireToken", checkExpireToken);

module.exports = router;
