const { Client, Events, GatewayIntentBits } = require('discord.js');
const config = require("./config.json");
const fs = require('fs')
const userMsgCount = require("./userMsgCount.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

const prefix = "!";

if (userMsgCount.date == ""){
    var datetime = new Date();
    userMsgCount.date = datetime.toDateString();
    fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
}

function userExists(targetGuildID,targetUserID){
    /**
     * @param {targetGuildID} string id of guild we are interested in.
     * @param {targetUserID} string id of user we are interested in.
     * @returns {state}, boolean state representing whether or not target user exists in target guild msg logs.
     */

    let state = false;

    if (userMsgCount.guilds.hasOwnProperty(targetGuildID)){
        guildUsers = userMsgCount.guilds[targetGuildID].users;
        for (let i = 0; i < guildUsers.length; i++){
            if (guildUsers[i].userID === targetUserID){
                state = true;
            }
        }
    }

    return state;
}



client.on("messageCreate", function(message) {

    //check if we need to update current date in json.
    let currDate = new Date().toDateString();
    if (userMsgCount.date.split(" ")[2] !== currDate.split(" ")[2]){
        console.log(`Updating date from ${userMsgCount.date} to ${currDate}`)
        userMsgCount.date = currDate;
        fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
    }


    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }

    

  });

client.login(config.BOT_TOKEN);