// database.js

const mongoose = require("mongoose");

const uri =
  "mongodb+srv://filmxyz:filmxyz@filmxyz.qsydfti.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
});

const videoDownloadSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  downloadCount: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
const VideoDownload = mongoose.model("VideoDownload", videoDownloadSchema);

module.exports = { User, VideoDownload };
