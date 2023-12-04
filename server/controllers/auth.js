require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.summary = '登入帳號 (Login)'
   */
  /**
    #swagger.responses[200] = {
      description: 'OK',
    }
  */
  const user = await User.findOne({ userName: req.body.userName });
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      const accessToken = generateAccessToken({
        userName: user.userName,
        id: user._id,
      });
      const refreshToken = jwt.sign({ userName: user.userName, id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "2h" });
      res.json({
        result: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      res.send("Not allowed");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.summary = '註冊帳號 (Register)'
   */
  /**
    #swagger.responses[200] = {
      description: 'OK',
    }    
  */
  const { userType, firstName, lastName, userName, mail, password, confirmPassword } = req.body;
  const existingEmail = await User.findOne({ mail });
  const existingUserName = await User.findOne({ userName });

  if (existingEmail || existingUserName) {
    return res.status(400).json({ message: "User already exists." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords don't match" });
  }

  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({
    userType,
    firstName,
    lastName,
    userName,
    mail,
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();
    const accessToken = generateAccessToken({
      userName: user.userName,
      id: user._id,
    });
    const refreshToken = jwt.sign({ userName: user.userName, id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "2h" });
    res.status(201).json({
      result: newUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const guestLogin = async (req, res) => {
  /**
   * #swagger.tags = ['Auth']
   * #swagger.summary = '訪客登入 (Guest)'
   */
  /**
    #swagger.responses[200] = {
      description: 'OK',
    }
  */
  let user;
  let existingEmail;
  let existingUserName;
  let tries = 0;
  const maxTries = 10; // 可以設置一個最大嘗試次數以避免無限循環

  while (tries < maxTries) {
    const ID4 = generateRandomString(4);
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("password", salt);
    user = new User({
      userType: "Student",
      firstName: `${ID4}`,
      lastName: "Guest",
      userName: `Guest_${ID4}`,
      mail: `Guest_${ID4}@guest.com`,
      password: hashedPassword,
    });

    existingEmail = await User.findOne({ mail: user.mail });
    existingUserName = await User.findOne({ userName: user.userName });

    if (!existingEmail && !existingUserName) {
      break; // 如果沒有重複則跳出循環
    }

    tries++;
  }

  if (tries === maxTries) {
    return res.status(500).json({ message: "Failed to generate a unique user." });
  }

  try {
    const newUser = await user.save();
    const accessToken = generateAccessToken({
      userName: user.userName,
      id: user._id,
    });
    const refreshToken = jwt.sign({ userName: user.userName, id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "2h" });
    res.json({
      result: newUser,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateAccessToken = (userData) => {
  return jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "25m",
  });
};

const generateRandomString = (length) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join("");
};

module.exports = { login, register, guestLogin };
