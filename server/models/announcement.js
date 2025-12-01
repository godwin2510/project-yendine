const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	message: { type: String, required: true, trim: true },
	imageUrl: { type: String },
	createdBy: { type: String }, // admin email or name
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
