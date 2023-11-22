const express = require("express");
const router = express.Router();

const { login, register } = require("../controllers/auth");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

router.post("/login", login);
router.post("/register", register);

module.exports = router;
