const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

// Get all food items
router.get('/', foodController.getAllFood);

// Get a single food item
router.get('/:id', foodController.getFoodById);

// Create a new food item
router.post('/', foodController.createFood);

// Update a food item
router.put('/:id', foodController.updateFood);

// Delete a food item
router.delete('/:id', foodController.deleteFood);

// Toggle food availability
router.patch('/:id/toggle-availability', foodController.toggleAvailability);

module.exports = router; 