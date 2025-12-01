const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');
const adminAuth = require('../middleware/adminAuth');

// List announcements (public)
router.get('/', async (req, res) => {
	try {
		const items = await Announcement.find().sort({ createdAt: -1 });
		res.json({ success: true, announcements: items });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to fetch announcements' });
	}
});

// Create announcement (admin only)
router.post('/', adminAuth, async (req, res) => {
	try {
		const { title, message, image } = req.body;
		if (!title || !message) {
			return res.status(400).json({ success: false, message: 'Title and message are required' });
		}
		// If image is a base64 data URL, store it directly in imageUrl
		// In a production app you would upload to Cloud storage and store the returned URL.
		const created = await Announcement.create({
			title,
			message,
			imageUrl: image || undefined,
			createdBy: req.user?.email || 'admin'
		});
		res.status(201).json({ success: true, announcement: created });
	} catch (err) {
		console.error('Create announcement error:', err);
		res.status(500).json({ success: false, message: 'Failed to create announcement' });
	}
});

module.exports = router;
