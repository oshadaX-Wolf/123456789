const TelegramBot = require("node-telegram-bot-api");
  const { ttdl } = require("btch-downloader");
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
const token = "6234064473:AAES5BMJt3cTs3i7_vVt8T-jjqoAzNiIGp8"; // Store your bot token securely
const bot = new TelegramBot(token, { polling: true });

const adminId = "5310455183"; // Replace with your Telegram user ID

// Express server
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
