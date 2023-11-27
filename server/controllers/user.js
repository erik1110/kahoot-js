const mongoose = require("mongoose");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.summary = '建立使用者帳號 (Create a user)'
   */
  /**
  #swagger.parameters['parameter'] = {
    in: 'body',
    description: 'Body',
    schema: {
      'userType': 'Teacher',
      'firstName': 'Erik',
      'lastName': 'Ho',
      'userName': 'erik1110',
      'mail': 'abc@gmail.com',
      'password': 'abc12345678',
    }
  }
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { userType, firstName, lastName, userName, mail, password } = req.body;
  const salt = await bcrypt.genSalt()
  const hashedPassword = await bcrypt.hash(password, salt)
  console.log(salt)
  console.log(hashedPassword)
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
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.summary = '取得所有帳號 (Get all users)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.summary = '取得特定使用者 (Get the user)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.summary = '更新使用者帳號 (Update the user)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No user with id: ${id}`);
  }

  const { userType, firstName, lastName, userName, mail, password } = req.body;
  const user = new User({
    _id: id,
    userType,
    firstName,
    lastName,
    userName,
    mail,
    password,
  });

  try {
    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  /**
   * #swagger.tags = ['User']
   * #swagger.summary = '刪除使用者帳號 (Delete the user)'
   */
  /**
  #swagger.security=[{"Bearer": []}],
  #swagger.responses[200] = {
    description: 'OK',
  }    
  */
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No user with id: ${id}`);
  }

  try {
    await User.findByIdAndRemove(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser };
