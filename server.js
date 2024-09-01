
const express = require('express');
const mongoose = require('mongoose');
const { User, VideoDownload } = require('./database'); // Update path as necessary

const app = express();
const port = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to handle JSON and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Existing route for bot status
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const data = {
    status: "true",
    message: "Bot Successfully Activated!",
    author: "vimukthi_oshada",
  };
  const result = {
    response: data,
  };
  res.send(JSON.stringify(result, null, 2));
});

// Route to view user count
app.get("/usercount", async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    res.send(`
      <h1>User Count</h1>
      <p>Total Users: ${userCount}</p>
      <a href="/">Back to Home</a>
    `);
  } catch (error) {
    res.status(500).send('Error retrieving user count');
  }
});

// Route to view video download counts
app.get("/videodownloads", async (req, res) => {
  try {
    const downloads = await VideoDownload.find({});
    const downloadCounts = downloads.map(download => ({
      videoId: download.videoId,
      downloadCount: download.downloadCount,
    }));

    res.send(`
      <h1>Video Download Counts</h1>
      <ul>
        ${downloadCounts.map(download => `<li>Video ID: ${download.videoId} - Downloads: ${download.downloadCount}</li>`).join('')}
      </ul>
      <a href="/">Back to Home</a>
    `);
  } catch (error) {
    res.status(500).send('Error retrieving video download counts');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
