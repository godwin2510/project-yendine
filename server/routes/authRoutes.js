const express = require('express');
const Router = express.Router();
const { googleAuth } = require('../controllers/authController');

// Log all requests to auth routes
Router.use((req, res, next) => {
    console.log('Auth route accessed:', req.method, req.url);
    next();
});

// Google auth endpoint
Router.get("/google", (req, res, next) => {
    console.log('Google auth endpoint hit with code:', req.query.code);
    googleAuth(req, res, next);
});

module.exports = Router;