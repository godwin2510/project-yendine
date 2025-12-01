const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Google authentication
router.get('/google', authController.googleAuth);

// Check if user is admin
router.get('/check-admin', auth, async (req, res) => {
    try {
        res.json({ 
            isAdmin: req.user.isAdmin,
            user: {
                email: req.user.email,
                name: req.user.name,
                image: req.user.image
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;