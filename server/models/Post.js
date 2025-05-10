const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  }
});

const postSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['yit', 'events']
  },
  author: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [commentSchema],
  likedBy: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 