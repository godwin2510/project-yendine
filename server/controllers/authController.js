const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../models/userModel');

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required"
        });
    }

    try {
        console.log('Getting token from Google...');
        const googleRes = await oauth2Client.getToken(code);
        console.log('Token received from Google');
        
        oauth2Client.setCredentials(googleRes.tokens);
        console.log('Getting user info from Google...');
        
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        console.log('User info received:', userRes.data);
        
        const { email, name, picture } = userRes.data;
        if (!email || !name) {
            throw new Error('Required user data missing from Google response');
        }

        let user = await User.findOne({ email });
        if (!user) {
            console.log('Creating new user...');
            user = await User.create({
                name,
                email,
                image: picture,
            });
            console.log('New user created:', user);
        }

        const { _id } = user;
        const token = jwt.sign(
            { _id, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_TIMEOUT || '7d' }
        );

        res.status(200).json({
            message: 'success',
            token,
            user: {
                email: user.email,
                name: user.name,
                image: user.image
            }
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            message: "Authentication failed",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};