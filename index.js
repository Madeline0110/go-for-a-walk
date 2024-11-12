import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from "./config.json" assert { type: 'json' };
import fs from 'fs';
import userMsgCount from "./userMsgCount.json" assert { type: 'json' };

import {guildExists, userExists, addUser, incUserMsgCount, checkLimit} from './functions.js'

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



client.on("messageCreate", function(message) {
    
    //dont want to log bot messages
    if (message.author.bot) return;

    // format input string assuming it is a command
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    const userRoles = message.member.roles.cache.map(role => role.name);

    const targetGuildID = message.guildId;
    const targetUserID = message.author.id;
    const targetUsername = message.author.username;
    const guildAdminRole = userMsgCount.guilds[targetGuildID].adminRole;

    //limit users who can call commands
    if (guildAdminRole === '' || userRoles.includes(guildAdminRole)){
        if (command == "help"){
            message.reply("There currently exists the following commands:\n* !help - returns list of all commands.\n* !setAdmin - Set the admin role that can call ! commands.\n* !setMsgLimit {integer} - Set the limit for which further messages from a user will result in mute / 'take a walk msg'.\n* !toggleMute - Turn muting of users that cross message limit threshold on or off.\n* !setMuteLength {integer} - Set mute duration (minutes).\n* !unmute {username/id} - Given a valid username or id input, unmute this user.\n* !setmsg {string} - Set a custom message for users that cross limit.");
            return;
        }else if (command == "setadmin"){
            //ensure an input was provided
            if (args[0] === undefined){
                message.reply("Please provide an input string.")
                return;
            }

            userMsgCount.guilds[targetGuildID].adminRole = args[0];
            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            message.reply(`Set admin role to ${args[0]}`);
            return;
    
        }else if (command == "setmsglimit"){
            if (!Number.isInteger(Number(args[0])) || Number(args[0]) <= 0 || args[0] === undefined){
                message.reply("Invalid input, must be a valid Integer > 0.")
                return;
            }
            userMsgCount.guilds[targetGuildID].msgLimit = Number(args[0]);
            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            message.reply(`Set msgLimit to ${args[0]}`);
            return;

        }else if (command == "togglemute"){
            
            //get current mute state, and negate it.
            let currState = userMsgCount.guilds[targetGuildID].muteState;
            if (currState){
                userMsgCount.guilds[targetGuildID].muteState = false;
            } else {
                userMsgCount.guilds[targetGuildID].muteState = true;
            }

            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            message.reply(`Set mute state to ${!currState}.`);
            return;
    
        }else if (command == "setmutelength"){
            // ensure input is valid integer > 0
            if (!Number.isInteger(Number(args[0])) || Number(args[0]) <= 0 || args[0] === undefined){
                message.reply("Invalid input, must be a valid Integer > 0.")
                return;
            }
            userMsgCount.guilds[targetGuildID].muteLength = Number(args[0]);
            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            message.reply(`Set mute length to ${args[0]}`);
            return;
    
        }else if (command == "unmute"){
        
        }else if (command == "setmsg"){
            if (args[0] === undefined){
                message.reply("Please provide an input string.")
                return;
            }
            userMsgCount.guilds[targetGuildID].touchGrassMSG = args[0];
            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            message.reply(`Set custom message to ${args[0]}`);
            return;
        }
    }



    // console.log(message)
    // console.log(message.author.id)
    // console.log(message.author.username)

    // check if we need to update current date in json.
    let currDate = new Date().toDateString();
    if (userMsgCount.date.split(" ")[2] !== currDate.split(" ")[2]){
        console.log(`Updating date from ${userMsgCount.date} to ${currDate}`)
        userMsgCount.date = currDate;
        fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
    }

    // check if guild for msg doesnt exist
    if (!guildExists(userMsgCount,targetGuildID)){
        userMsgCount.guilds[targetGuildID] = {
            "adminRole": "",
            "msgLimit": 100,
            "muteState": false,
            "muteLength": 30,
            "touchGrassMSG": "Go for a walk.",
            "users":[{ "userID": targetUserID, "username": targetUsername, "msgCount": 1 }]
        };
        fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
    }
    // check if user exists in a given guild
    else if (!userExists(userMsgCount,targetGuildID, targetUserID)){
        addUser(userMsgCount,targetGuildID,targetUserID,targetUsername);
    } else{
        //if user does exist then increment their msgCount counter
        incUserMsgCount(userMsgCount,targetGuildID,targetUserID);
        if (checkLimit(userMsgCount,targetGuildID,targetUserID)){
            if (userMsgCount.guilds[targetGuildID].muteState){
                //mute the user
            }

            message.reply(userMsgCount.guilds[targetGuildID].touchGrassMSG);
        }
    }

  });

client.login(config.BOT_TOKEN);