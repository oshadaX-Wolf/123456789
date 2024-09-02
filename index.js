
const TelegramBot = require("node-telegram-bot-api");
const { ttdl } = require("btch-downloader");
const { VideoDownload } = require("./database"); // Update path as necessary

const util = require("util");
const chalk = require("chalk");
const figlet = require("figlet");
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const request = require("request");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");
const { User } = require("./database"); // Import the User model

// Initialize bot with polling
const token = "6162835664:AAH4U09W70ro9ltzJ4ikopkccIc-YKl3B5U"; // Store your bot token securely
const bot = new TelegramBot(token, { polling: true });

const adminId = "5310455183"; // Replace with your Telegram user ID

// Function to pause execution for a specified time
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded data

// Function to generate HTML with embedded CSS
function renderPage(userCount, resultHtml = "") {
  return `
    <html>
    <head>
      <title>TikTok Downloader</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f0f2f5;
          color: #333;
          text-align: center;
          padding: 20px;
        }

        h1 {
          color: #ff4500;
          font-size: 3em;
          margin-bottom: 20px;
          text-shadow: 2px 2px #f7f7f7;
        }

        p {
          font-size: 1.2em;
          margin-bottom: 15px;
        }

        form {
          margin: 20px auto;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }

        label {
          font-size: 1.2em;
          color: #333;
        }

        input[type="text"] {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          font-size: 1.1em;
          border: 2px solid #ddd;
          border-radius: 5px;
          outline: none;
          transition: border-color 0.3s ease-in-out;
        }

        input[type="text"]:focus {
          border-color: #ff4500;
        }

        button {
          background-color: #ff4500;
          color: white;
          padding: 10px 20px;
          font-size: 1.2em;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease-in-out;
        }

        button:hover {
          background-color: #e63e00;
        }

        .result {
          margin-top: 30px;
          padding: 20px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .result p {
          font-size: 1.1em;
          color: #555;
        }

        .result a {
          color: #ff4500;
          text-decoration: none;
          font-weight: bold;
          transition: color 0.3s ease, transform 0.3s ease;
        }

        .result a:hover {
          color: #e63e00;
          transform: scale(1.05); /* Slightly enlarge the link */
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .video-preview {
          margin-top: 20px;
        }

        video {
          width: 100%;
          max-width: 500px;
          border-radius: 10px;
          box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
        }
      </style>
    </head>
    <body>
      <h1>TikTok Downloader Bot</h1>
      <p>Total Users: ${userCount}</p>
      <form action="/download" method="post">
        <label for="url">Paste TikTok URL here:</label><br>
        <input type="text" id="url" name="url" required><br><br>
        <button type="submit">Download</button>
      </form>
      ${resultHtml}
    </body>
    </html>
  `;
}

app.get("/", async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    res.send(renderPage(userCount));
  } catch (err) {
    console.error("Error loading the page:", err);
    res.status(500).send("Error loading the page");
  }
});

app.post("/download", async (req, res) => {
  const url = req.body.url;

  if (!url || !/^https:\/\/.*tiktok\.com\/.+/.test(url)) {
    return res.status(400).send("Invalid or missing TikTok URL");
  }

  try {
    const data = await ttdl(url);
    const videoUrl = data.video[0];
    const audioUrl = data.audio[0];

    const userCount = await User.countDocuments({});
    const resultHtml = `
      <div class="result">
        <p>🎥 <strong>Video URL:</strong> <a href="${videoUrl}" target="_blank">${videoUrl}</a></p>
        <p>🎵 <strong>Audio URL:</strong> <a href="${audioUrl}" target="_blank">${audioUrl}</a></p>
        <div class="video-preview">
          <video controls>
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    `;
    res.send(renderPage(userCount, resultHtml));
  } catch (error) {
    console.error("Error downloading TikTok video:", error);
    res.status(500).send("Error downloading TikTok video");
  }
});





function listenOnPort(port) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  app.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use. Trying another port...`);
      listenOnPort(port + 1);
    } else {
      console.error(err);
    }
  });
}

listenOnPort(port);

// Bot startup time
let Start = new Date();

// Logging function
const logs = (message, color) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(chalk[color](`[${timestamp}] => ${message}`));
};

// Figlet banner
const Figlet = () => {
  figlet.text(
    "TikTok Downloader",
    {
      font: "Standard",
      horizontalLayout: "default",
    },
    (err, data) => {
      if (err) {
        console.log("Error:", err);
        return;
      }
      console.log(chalk.cyan.bold(data));
      console.log(chalk.cyan.bold("BOTCAHX - TikTok Downloader Bot"));
    },
  );
};

// Handle polling errors
bot.on("polling_error", (error) => {
  logs(`Polling error: ${error.message}`, "blue");
});

// Set bot commands with emojis
bot.setMyCommands([
  { command: "/start", description: "🚀 Start a new conversation" },
  { command: "/runtime", description: "⏳ Check bot runtime" },
  { command: "/owner", description: "👤 Bot Owner" },
  { command: "/usercount", description: "📊 View user count (Admin)" },
  { command: "/broadcast", description: "📢 Broadcast a message (Admin)" },
]);

// /runtime command
bot.onText(/^\/runtime$/, (msg) => {
  const now = new Date();
  const uptimeMilliseconds = now - Start;
  const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const From = msg.chat.id;
  const uptimeMessage = `🕒 *Active*: ${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;

  bot.sendMessage(From, uptimeMessage, { parse_mode: "Markdown" });
});

// /start command with three buttons
bot.onText(/^\/start$/, async (msg) => {
  const From = msg.chat.id;

  // Add user to MongoDB
  await User.findOneAndUpdate(
    { userId: From.toString() },
    { userId: From.toString() },
    { upsert: true },
  );

  const caption = `
✨ *Welcome to TikTok Downloader Bot!* ✨
I'm here to help you download TikTok videos automatically. Just send me the TikTok URL and I'll do the rest! 

🔹 _Features:_
1. Download TikTok videos 📹
2. Extract audio 🎧
3. Quick and easy to use 🚀

Feel free to share this bot with your friends!`;

  const options = {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📥 Download Video", callback_data: "download_video" },
          { text: "⏳ Check Runtime", callback_data: "check_runtime" },
          { text: "👤 Owner Info", callback_data: "owner_info" },
        ],
        [
          { text: "🔗 Join Our Channel", url: "https://t.me/botdves" }, // External link button
        ],
      ],
    },
  };

  bot.sendMessage(From, caption, options);
  bot.sendSticker(
    From,
    "CAACAgIAAxkBAAECWvtm0MgJmvhfy5ZTc83aNr0wU9GxpQACcSAAAr6A-Uqv-laZwM-fdzUE",
  ); // Replace with your sticker file ID

  // Notify admin of new user
  if (From.toString() !== adminId) {
    await bot.sendMessage(adminId, `🔔 New user started the bot: ${From}`);
  }
});

// Handle button clicks
bot.on("callback_query", async (callbackQuery) => {
  const message = callbackQuery.message;
  const From = message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case "download_video":
      await bot.sendMessage(
        From,
        "📥 *Download Video*\nPlease send me the TikTok URL you wish to download.",
        { parse_mode: "Markdown" },
      );
      break;

    case "check_runtime":
      const now = new Date();
      const uptimeMilliseconds = now - Start;
      const uptimeSeconds = Math.floor(uptimeMilliseconds / 1000);
      const uptimeMinutes = Math.floor(uptimeSeconds / 60);
      const uptimeHours = Math.floor(uptimeMinutes / 60);

      const uptimeMessage = `🕒 *Active*: ${uptimeHours}h ${uptimeMinutes % 60}m ${uptimeSeconds % 60}s`;
      await bot.sendMessage(From, uptimeMessage, { parse_mode: "Markdown" });
      break;

    case "owner_info":
      const ownerMessage = `👤 *Bot Owner*: @vimukthioshada`;
      await bot.sendMessage(From, ownerMessage, { parse_mode: "Markdown" });
      break;

    default:
      await bot.sendMessage(From, "❌ Unknown command.");
  }

  // Acknowledge the callback to remove the loading state
  await bot.answerCallbackQuery(callbackQuery.id);
});

// /owner command
bot.onText(/^\/owner$/, (msg) => {
  const From = msg.chat.id;
  const ownerMessage = `👤 *Bot Owner*: @vimukthioshada`;

  bot.sendMessage(From, ownerMessage, { parse_mode: "Markdown" });
});

// /usercount command for admin to check the user count
bot.onText(/^\/usercount$/, async (msg) => {
  const From = msg.chat.id;
  if (From.toString() === adminId) {
    const userCount = await User.countDocuments({});
    const userCountMessage = `📊 *Total Users*: ${userCount}`;
    bot.sendMessage(From, userCountMessage, { parse_mode: "Markdown" });
  } else {
    bot.sendMessage(From, "❌ You do not have permission to use this command.");
  }
});

// /broadcast command for admin to send messages to all users
bot.onText(/^\/broadcast (.+)$/, async (msg, match) => {
  const From = msg.chat.id;
  const message = match[1]; // Extract the message to broadcast

  if (From.toString() !== adminId) {
    await bot.sendMessage(
      From,
      "❌ You do not have permission to use this command.",
    );
    return;
  }

  if (!message) {
    await bot.sendMessage(
      From,
      "❌ Please provide a message to broadcast. Usage: /broadcast Your message here",
    );
    return;
  }

  const users = await User.find({});

  let successCount = 0;
  let failureCount = 0;

  for (const user of users) {
    try {
      await bot.sendMessage(
        user.userId,
        `📢 *Broadcast Message*\n\n${message}`,
        {
          parse_mode: "Markdown",
        },
      );
      successCount++;
    } catch (error) {
      console.log(`Failed to send message to ${user.userId}: ${error.message}`);
      failureCount++;
    }
  }

  await bot.sendMessage(
    From,
    `📤 Broadcast completed.\n✅ Success: ${successCount}\n❌ Failed: ${failureCount}`,
    { parse_mode: "Markdown" },
  );
});

// Handling messages with TikTok URLs and downloading video
bot.on("message", async (msg) => {
  Figlet();
  logs("Success activated", "green");
  const From = msg.chat.id;

  const body = /^https:\/\/.*tiktok\.com\/.+/;
  if (body.test(msg.text)) {
    const url = msg.text;
    try {
      let progress = 0;
      let progressMessage = await bot.sendMessage(
        From,
        `🔄 Downloading your TikTok video... 0%`,
      );

      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90) {
          bot.editMessageText(
            `🔄 Downloading your TikTok video... ${progress}%`,
            {
              chat_id: From,
              message_id: progressMessage.message_id,
            },
          );
        }
      }, 1000); // Simulating download progress

      const data = await ttdl(url);
      clearInterval(progressInterval);

      const videoUrl = data.video[0];
      const audioUrl = data.audio[0];
      const { title, title_audio } = data;

      const videoFileName = `video_${From}.mp4`;

      // Download the video file to local storage
      const downloadVideo = util.promisify(request.get);
      const videoStream = fs.createWriteStream(videoFileName);
      await new Promise((resolve, reject) => {
        request
          .get(videoUrl)
          .on("error", (err) => reject(err))
          .pipe(videoStream)
          .on("finish", () => resolve())
          .on("error", (err) => reject(err));
      });

      // Increment video download count
      const videoId = url; // Use a unique identifier for the video
      await VideoDownload.findOneAndUpdate(
        { videoId },
        { $inc: { downloadCount: 1 } },
        { upsert: true },
      );

      // Prepare video message
      await bot.editMessageText(`🔄 Downloading your TikTok video... 100%`, {
        chat_id: From,
        message_id: progressMessage.message_id,
      });

      const videoOptions = {
        caption: `🎬 *${title}*`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔗 Visit Our Channel",
                url: "https://t.me/botdves", // Replace with your desired URL
              },
            ],
          ],
        },
      };

      await bot.sendVideo(From, videoFileName, videoOptions);
      await sleep(3000);
      await bot.sendAudio(From, audioUrl, {
        caption: `🎵 *${title_audio}*`,
        parse_mode: "Markdown",
      });

      await sleep(3000);
      await bot.sendMessage(
        From,
        "✅ *Download complete!* \n\nPowered by @vimukthioshada",
        { parse_mode: "Markdown" },
      );

      // Clean up files
      fs.unlinkSync(videoFileName);
    } catch (error) {
      bot.sendMessage(
        From,
        "❌ Sorry, an error occurred while downloading the TikTok video.",
      );
      console.log(`[ ERROR ] ${From}: ${error.message}`, "red");
    }
  }
});
// Function to pause execution for a specified time
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
