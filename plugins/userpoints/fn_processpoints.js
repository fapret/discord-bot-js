const Discord = require('discord.js');

module.exports = {
    name: 'userpoints.fn_processpoints',
    description: 'implementacion de fn_processpoints',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_processpoints
}

async function fn_processpoints(API, message, properties, userData, leaderboard) {
    let messageTimestamp = message.createdAt.getTime();
    let timepassedmili = Math.abs(messageTimestamp - userData.lastTimestampText);
    let timepassed = Math.round(timepassedmili / (60 * 1000)); //in minutes
    if(timepassed >= properties.xpData.textInterval){
        userData.lastTimestampText = messageTimestamp;
        let pointsToAdd = Math.floor(Math.random() * (properties.xpData.textMax - properties.xpData.textMin + 1) + properties.xpData.textMin)
        userData.textPoints += pointsToAdd;
        userData.totalTextPoints += pointsToAdd;
        
    }
}