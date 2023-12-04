const express = require("express");
const router = express.Router();

const { login, register, guestLogin } = require("../controllers/auth");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

router.post("/login", login);
router.post("/register", register);
router.post("/guestLogin", guestLogin);

module.exports = router;
