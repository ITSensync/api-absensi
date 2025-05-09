const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController")


// /**
//  * @swagger
//  * tags:
//  *   name: Auth
//  *   description: API untuk mengelola auth
//  */
router.post("/", authController.login);

module.exports = router;