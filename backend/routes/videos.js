const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { verifyFirebaseToken, verifyAdminToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Get user's videos
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.user._id })
      .sort({ uploadDate: -1 });
    
    console.log(`📹 Retrieved ${videos.length} videos for ${req.user.email}`);
    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all videos (admin only)
router.get('/all', verifyAdminToken, async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('userId', 'email role')
      .sort({ uploadDate: -1 });
    
    console.log(`📹 Retrieved ${videos.length} total videos (admin)`);
    res.json(videos);
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload video (editor/admin only)
router.post('/upload', verifyFirebaseToken, checkRole('editor', 'admin'), upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log(`📤 Uploading: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const video = await Video.create({
      userId: req.user._id,
      title: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      status: 'uploading',
      progress: 0
    });

    console.log(`✅ Video created: ${video._id}`);

    // Start processing in background
    processVideo(video._id, req.app.get('io'));

    res.json(video);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Stream video
router.get('/:videoId/stream', verifyFirebaseToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check permissions
    if (video.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const videoPath = path.join(__dirname, '../uploads', video.filename);

    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({ error: 'Streaming error' });
  }
});

// Delete video
router.delete('/:videoId', verifyFirebaseToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check permissions
    if (video.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from disk
    const videoPath = path.join(__dirname, '../uploads', video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      console.log(`🗑️ Deleted file: ${video.filename}`);
    }

    await Video.findByIdAndDelete(req.params.videoId);
    console.log(`✅ Deleted video: ${video.title}`);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Background video processing function
async function processVideo(videoId, io) {
  try {
    console.log(`🔄 Processing video: ${videoId}`);

    // Simulate upload progress (0-100%)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await Video.findByIdAndUpdate(videoId, {
        progress: i,
        status: i === 100 ? 'processing' : 'uploading'
      });
      
      const video = await Video.findById(videoId);
      io.emit('videoProgress', video);
      console.log(`📊 Upload progress: ${i}%`);
    }

    // Simulate content analysis (0-100%)
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updates = {
        progress: i,
        status: i === 100 ? 'completed' : 'processing'
      };

      // At 100%, assign sensitivity (simulated)
      if (i === 100) {
        updates.sensitivity = Math.random() > 0.3 ? 'safe' : 'flagged';
        console.log(`🎯 Video analysis complete: ${updates.sensitivity}`);
      }

      await Video.findByIdAndUpdate(videoId, updates);
      
      const video = await Video.findById(videoId);
      io.emit('videoProgress', video);
      console.log(`🔍 Analysis progress: ${i}%`);
    }

    console.log(`✅ Video processing complete: ${videoId}`);
  } catch (error) {
    console.error('Processing error:', error);
    await Video.findByIdAndUpdate(videoId, { status: 'failed' });
  }
}

module.exports = router;
