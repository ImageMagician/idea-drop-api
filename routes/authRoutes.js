import express from 'express';
import User from '../models/User.js';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from "../utils/getJwtSecret.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

/**
 * @route       POST api/auth/register
 * @description Register new user
 * @access      Public
 */
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body || {};

        if ( !name || !email || !password ) {
            res.status(400);
            throw new Error ('All fields are required');
        }

        const existingUser = await User.findOne({email: email});

        if (existingUser) {
            res.status(400);
            throw new Error ('User already exists');
        }

        const user = await User.create({
            name, email, password
        });

        // Create tokens
        const payload = {
            userId: user._id.toString()
        }

        const accessToken = await generateToken(payload, '1m');
        const refreshToken = await generateToken(payload, '30d');

        // Set refresh token in HTTP-Only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (err) {
        console.error(err);
        next(err);
    }
})

/**
 * @route       POST api/auth/login
 * @description Login a registered user
 * @access      Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if ( !email || !password ) {
            res.status(400);
            throw new Error('Email and password are required.');
        }

        //Find user
        const user = await User.findOne({ email });

        if (!user) {
            res.status(401);
            throw new Error("Invalid credentials");
        }

        // Check for password match
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            res.status(401);
            throw new Error("Invalid credentials");
        }

        // create tokens

        // Create tokens
        const payload = { userId: user._id.toString() }

        const accessToken = await generateToken(payload, '1m');
        const refreshToken = await generateToken(payload, '30d');

        // Set refresh token in HTTP-Only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

/**
 * @route       POST api/auth/register
 * @description Logout user and clear refresh token
 * @access      Private
 */
router.post('/logout', async (req, res, next) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
    });

    res.status(200).json({
        message: "Logged out successfully.",
    });
})

/**
 * @Route       POST api/auth/refresh
 * @Description generate new access token from refresh token
 * @access      Public (needs valid refresh token in cookie)
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken;
        console.log('refreshing token', token);

        if (!token) {
            res.status(401);
            throw new Error("No refresh token available");
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        const user = await User.findById(payload.userId);

        if (!user) {
            res.status(401);
            throw new Error("No user found.");
        }

        const newAccessToken = await generateToken({userId: user._id.toString()}, '1m');

        res.json({
            accessToken: newAccessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        })
    }
    catch (err) {
        res.status(401);
        console.log(err);
        next(err);
    }
})

export default router;