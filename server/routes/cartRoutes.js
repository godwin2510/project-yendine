const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModel');

// Get cart for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await Cart.findOne({ userId }).populate('items.foodId');
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = new Cart({ userId, items: [], totalAmount: 0 });
      await cart.save();
    }
    
    res.json({
      success: true,
      cart: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { userId, foodId, name, price, quantity, image, category } = req.body;
    
    if (!userId || !foodId || !name || !price || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create new cart if doesn't exist
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.foodId.toString() === foodId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        foodId,
        name,
        price,
        quantity,
        image,
        category
      });
    }
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
});

// Update item quantity in cart
router.put('/update-quantity', async (req, res) => {
  try {
    const { userId, foodId, quantity } = req.body;
    
    if (!userId || !foodId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.foodId.toString() === foodId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { userId, foodId } = req.body;
    
    if (!userId || !foodId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(item => 
      item.foodId.toString() !== foodId
    );
    
    await cart.save();
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

module.exports = router;
