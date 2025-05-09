const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Login user
//  *     tags:
//  *       - Auth
//  *     description: Login dengan username dan password untuk mendapatkan token JWT.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - username
//  *               - password
//  *             properties:
//  *               username:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *                 format: password
//  *     responses:
//  *       200:
//  *         description: Login berhasil
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 token:
//  *                   type: string
//  *       400:
//  *         description: Username atau password kosong
//  *       401:
//  *         description: Kredensial tidak valid
//  *       500:
//  *         description: Kesalahan server
//  */

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    User.findByUsername(username, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid username or password" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error("Error comparing passwords:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (!isMatch) {
                return res.status(401).json({ error: "Invalid username or password" });
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, "SECRET_KEY", { expiresIn: "1h" });

            res.json({ message: "Login successful", token });
        });
    });
};
