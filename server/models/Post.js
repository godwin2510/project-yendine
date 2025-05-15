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
    default: '/placeholder.svg'
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
    url: String,
    public_id: String
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

// Add a pre-save middleware to handle image data
postSchema.pre('save', function(next) {
  // If image is a string (base64), convert it to the proper format
  if (this.image && typeof this.image === 'string') {
    this.image = {
      url: this.image,
      public_id: null
    };
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 