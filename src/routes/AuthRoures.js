import express from 'express'
import User from '../models/User.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const router = express.Router()
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '2d' })
}

router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        // 
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, msg: "All fields are required!" })
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, msg: "Password must be at least 6 characters" })
        }

        if (username.length < 3) {
            return res.status(400).json({ success: false, msg: "username must be greater than 3 characters" })
        }



        const existsUser = await User.findOne({ email: email })

        if (existsUser) {
            return res.status(400).json({ success: false, msg: 'User already exists' })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // random avator//

        const profile = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${username}`
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            image: profile
        })

        const token = createToken(newUser._id)
        return res.status(201).json({
            success: true,
            token,
            user: {
                username: newUser.username,
                email: newUser.email,
                profileImage: newUser.image
            },
            msg: 'User registerd successfully'
        })

    } catch (error) {
        res.json({ success: false, msg: error.message })
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Email and password are required!" })
        }

        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ success: false, msg: "Invalid email or password" })
        }

        // Ensure both values are strings
        const isMatch = await bcrypt.compare(String(password), String(user.password));
        if (!isMatch) {
            return res.status(400).json({ success: false, msg: "Invalid email or password" })
        }

        const token = createToken(user._id)

        return res.status(200).json({
            success: true,
            token,
            user: {
                username: user.username,
                email: user.email,
                profileImage: user.image
            },
            msg: 'Login successful'
        })

    } catch (error) {
        res.json({ success: false, msg: error.message })
    }
})

export default router