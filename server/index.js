require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/Post');
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const { upload, cloudinary } = require('./utils/cloudinary');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/foods', foodRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/yendine', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new post with image upload
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    console.log('Received post request:', {
      body: req.body,
      file: req.file,
      headers: req.headers['content-type']
    });

    // Validate required fields
    const requiredFields = ['category', 'title', 'content', 'author'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }

    let imageData = null;
    
    // Handle file upload
    if (req.file) {
      console.log('Processing uploaded file:', req.file);
      console.log('req.file:', req.file);
      imageData = {
        url: req.file.path || req.file.secure_url || req.file.url,
        public_id: req.file.filename || req.file.public_id
      };
    }
    // Handle base64 image
    else if (req.body.image && req.body.image.startsWith('data:image')) {
      console.log('Processing base64 image');
      try {
        // Upload base64 image to Cloudinary
        const result = await cloudinary.uploader.upload(req.body.image, {
          folder: 'yendine-posts',
          resource_type: 'auto'
        });
        
        console.log('Cloudinary upload result:', result);
        
        imageData = {
          url: result.secure_url,
          public_id: result.public_id
        };
      } catch (uploadError) {
        console.error('Error uploading base64 image:', uploadError);
        return res.status(400).json({
          message: 'Failed to upload image to Cloudinary',
          error: uploadError.message,
          details: uploadError
        });
      }
    } else {
      console.log('No image data found in request');
    }

    // Remove image from body if it exists to avoid duplicate data
    const { image, ...postBody } = req.body;

    const postData = {
      ...postBody,
      image: imageData,
      timestamp: new Date().toISOString()
    };
    
    console.log('Creating post with data:', postData);
    
    const post = new Post(postData);
    const savedPost = await post.save();
    
    console.log('Post saved successfully:', savedPost);
    
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      receivedData: req.body
    });
  }
});

// Like/Unlike a post
app.patch('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const hasLiked = post.likedBy.includes(userId);
    
    if (hasLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likes -= 1;
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a comment
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push(req.body);
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete image from Cloudinary if exists
    if (post.image && post.image.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a comment
app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments = post.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});