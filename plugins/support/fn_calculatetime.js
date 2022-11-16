const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_calculatetime',
    description: 'implementacion de fn_calculatetime',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_calculatetime
}

function fn_calculatetime(dataManager, interaction, supportID, supportMessageData, optionindex) {
    let pluginManager = dataManager.PluginDataManager;
    let userData = pluginManager.readData('user/' + interaction.member.id);
    let d = new Date(Date.now());
    if(userData){
        let timeAmount = supportMessageData.options[optionindex]?.timeAmount;
        let timeType = supportMessageData.options[optionindex]?.timeType;
        let lastCreated;
        if((userData[supportID]) != undefined){
            lastCreated = new Date(userData[supportID][optionindex]);
            switch (timeType) {
                case 'month':
                case 'months':
                    timeAmount = timeAmount * 4;
                case 'week':
                case 'weeks':
                    timeAmount = timeAmount * 7;
                case 'day':
                case 'days':
                    timeAmount = timeAmount * 24;
                case 'hour':
                case 'hours':
                    timeAmount = timeAmount * 60;
                case 'minute':
                case 'minutes':
                    let timepassedmili = Math.abs(d - lastCreated);
                    let timepassed = Math.round(timepassedmili / (60 * 1000));
                    if(timepassed < timeAmount){
                        let waitTime = new Date(Date.now() + timeAmount * 60 * 1000 - timepassedmili).getTime();
                        interaction.reply({ content: 'Ya has creado un ticket recientemente, por favor espera <t:' + Math.round(waitTime / 1000) + ':R> minutos antes de crear un ticket', ephemeral: true });
                        return undefined;
                    }
                default:
                    break;
            }
        } else {
            userData[supportID] = [];
        }
    } else {
        userData = {};
        userData[supportID] = [];
    }
    userData[supportID][optionindex] = Date.now();
    pluginManager.writeData('user/' + interaction.member.id, userData);
    return supportMessageData;
}