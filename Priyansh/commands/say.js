const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "say",
  version: "1.0.3",
  hasPermssion: 0,
  credits: "𝐏𝐫𝐢𝐲𝐚𝐧𝐬𝐡 𝐑𝐚𝐣𝐩𝐮𝐭 + ChatGPT",
  description: "Make the bot return Google TTS audio (female Bangla voice preferred)",
  commandCategory: "media",
  usages: "[bn/en/ru/ko/ja/tl] [Text]",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": ""
  }
};

async function downloadTTS(text, lang, filepath) {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=gtx`;

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);
    let error = null;
    writer.on("error", err => {
      error = err;
      writer.close();
      reject(err);
    });
    writer.on("close", () => {
      if (!error) resolve(true);
    });
  });
}

module.exports.run = async function({ api, event, args }) {
  try {
    let content = (event.type === "message_reply") ? event.messageReply.body : args.join(" ");
    if (!content) return api.sendMessage("Please provide text to speak!", event.threadID, event.messageID);

    let languageToSay = global.config.language || "en"; // default language

    // Check if first word is language code like "bn Hello"
    const firstSpace = content.indexOf(" ");
    if (firstSpace > 0) {
      const possibleLang = content.slice(0, firstSpace).toLowerCase();
      const supportedLangs = ["bn", "en", "ru", "ko", "ja", "tl"];
      if (supportedLangs.includes(possibleLang)) {
        languageToSay = possibleLang;
        content = content.slice(firstSpace + 1);
      }
    }

    // Filepath for saving temp audio
    const audioPath = path.resolve(__dirname, "cache", `${event.threadID}_${event.senderID}.mp3`);

    // Download TTS audio
    await downloadTTS(content, languageToSay, audioPath);

    // Send voice message with audio attachment
    return api.sendMessage(
      { attachment: fs.createReadStream(audioPath) },
      event.threadID,
      () => fs.unlinkSync(audioPath),
      event.messageID
    );
  } catch (error) {
    console.log(error);
    return api.sendMessage("Failed to generate voice. Try again later.", event.threadID, event.messageID);
  }
};
