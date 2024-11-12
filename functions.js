import fs from 'fs';

function guildExists(userMsgCount,targetGuildID){
    /**
     * @param {userMsgCount} json object holding all user msg data
     * @param {targetGuildID} string id of guild we are interested in.
     * @returns true or false, dependingon if guild exists
     */

    return userMsgCount.guilds.hasOwnProperty(targetGuildID);
}

function userExists(userMsgCount,targetGuildID,targetUserID){
    /**
     * @param {userMsgCount} json object holding all user msg data
     * @param {targetGuildID} string id of guild we are interested in.
     * @param {targetUserID} string id of user we are interested in.
     * @returns {state}, boolean state representing whether or not target user exists in target guild msg logs.
     */

    let state = false;

    if (userMsgCount.guilds.hasOwnProperty(targetGuildID)){
        const guildUsers = userMsgCount.guilds[targetGuildID].users;
        for (let i = 0; i < guildUsers.length; i++){
            if (guildUsers[i].userID === targetUserID){
                state = true;
            }
        }
    }

    return state;
}

function addUser(userMsgCount,targetGuildID,targetUserID,targetUsername){
    /** Add a new user to the users array for a given guild
     * 
     * @param {userMsgCount} json object holding all user msg data
     * @param {targetGuildID} string id of guild we are interested in.
     * @param {targetUserID} string id of user we are interested in.
     * @param {targetUsername} string username of user we are interested in.
     */
    userMsgCount.guilds[targetGuildID].users.push({ "userID": targetUserID, "username": targetUsername, "msgCount": 1 });
    fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
    console.log(`Added new user ID: ${targetUserID} Name: ${targetUsername}`)
}

function incUserMsgCount(userMsgCount,targetGuildID,targetUserID){
    /** Increment the msgCount attribute for a given user
     * 
     * @param {userMsgCount} json object holding all user msg data
     * @param {targetGuildID} string id of guild we are interested in.
     * @param {targetUserID} string id of user we are interested in.
     */

    const usersArr = userMsgCount.guilds[targetGuildID].users
    for (let i = 0; i < usersArr.length; i++){
        if (usersArr[i].userID === targetUserID){
            usersArr[i].msgCount = usersArr[i].msgCount + 1;

            userMsgCount.guilds[targetGuildID].users = usersArr;
            fs.writeFileSync('./userMsgCount.json',JSON.stringify(userMsgCount));
            return;
        }
    }
}

function checkLimit(userMsgCount,targetGuildID,targetUserID){
    /** Checks if a given user has crossed the message limit
     * 
     * @param {userMsgCount} json object holding all user msg data
     * @param {targetGuildID} string id of guild we are interested in.
     * @param {targetUserID} string id of user we are interested in.
    */

    let state = false;
    let limit = userMsgCount.guilds[targetGuildID].msgLimit;

    const usersArr = userMsgCount.guilds[targetGuildID].users
    for (let i = 0; i < usersArr.length; i++){
        console.log(usersArr[i].msgCount);
        console.log(limit);
        if (usersArr[i].userID === targetUserID && usersArr[i].msgCount > limit){
            state = true;
        }
    }

    return state;
}

export {guildExists, userExists, addUser, incUserMsgCount, checkLimit};