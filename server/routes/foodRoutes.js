const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
const { upload } = require('../utils/cloudinary');

// Get all food items
router.get('/', foodController.getAllFood);

// Get a single food item
router.get('/:id', foodController.getFoodById);

// Create a new food item (with image upload support)
router.post('/', upload.single('image'), foodController.createFood);

// Update a food item (with image upload support)
router.put('/:id', upload.single('image'), foodController.updateFood);

// Delete a food item
router.delete('/:id', foodController.deleteFood);

// Toggle food availability
router.patch('/:id/toggle-availability', foodController.toggleAvailability);

module.exports = router; 