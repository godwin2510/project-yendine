const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedback');

// GET all feedback
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    // Get feedback with pagination and sorting
    const feedback = await Feedback.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .select('-__v'); // Exclude version key
    
    // Get total count for pagination
    const total = await Feedback.countDocuments();
    
    res.json({
      feedback,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// GET feedback by ID
router.get('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id).select('-__v');
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback by ID:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// POST new feedback
router.post('/', async (req, res) => {
  try {
    const { feedback, userEmail, userName } = req.body;
    
    // Validate required fields
    if (!feedback || !feedback.trim()) {
      return res.status(400).json({ message: 'Feedback content is required' });
    }
    
    const newFeedback = new Feedback({ 
      feedback: feedback.trim(), 
      userEmail: userEmail || null, 
      userName: userName || null 
    });
    
    await newFeedback.save();
    res.status(201).json({ 
      message: 'Feedback saved successfully',
      feedback: newFeedback
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Error saving feedback' });
  }
});

// DELETE feedback by ID (admin only - you might want to add authentication)
router.delete('/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ message: 'Error deleting feedback' });
  }
});

module.exports = router;