const axios = require("axios");

module.exports.config = {
    name: "raihan",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Maisha & ChatGPT",
    description: "Chat with SimSimi AI",
    commandCategory: "fun",
    usages: "[your message]",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args }) {
    try {
        const apiKey = "848362ba-ce7f-4eba-b90d-c5f5f6ce999f"; // Put your SimSimi API key here
        const text = args.join(" ");
        
        if (!text) {
            return api.sendMessage("💬 Please type something for me to reply!", event.threadID, event.messageID);
        }

        const url = `https://api.simsimi.vn/v1/simtalk?text=${encodeURIComponent(text)}&lc=en&key=${apiKey}`;
        const res = await axios.get(url);

        if (res.data.success) {
            api.sendMessage(res.data.success, event.threadID, event.messageID);
        } else {
            api.sendMessage("❌ Sorry, I couldn't get a reply from SimSimi.", event.threadID, event.messageID);
        }
    } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ Error: Could not connect to SimSimi API.", event.threadID, event.messageID);
    }
};
