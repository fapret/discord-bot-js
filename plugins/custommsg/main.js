const Discord = require('discord.js');
const fs = require('fs');

class Mutex {
    constructor() {
        this._locking = Promise.resolve();
    }
    lock() {
        let unlockNext;
        let willLock = new Promise(resolve => unlockNext = () => {      
            resolve();
        });
        let willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}

const MutexCreator = new Mutex();

const lockedMessages = new Map();

module.exports = {
    name: 'custommsg',
    description: 'modulo de mensajes customizados',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async onMessage(message, dataManager){
        try{
            lowercasemessage = message.content.toLowerCase();
            pluginManager = dataManager.PluginDataManager;
            CustomMessages = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
            if(CustomMessages == undefined){
                CustomMessages = [];
                pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), CustomMessages);
            }
            CustomMessages.forEach(element => {
                if(element.Channel == message.channel.id){
                    element.Messages.forEach(async (custommessage) => {
                        custommessage.Keywords.forEach(async (keyword) => {
                            if(((custommessage.WildCard == true) && (lowercasemessage.includes(keyword.toLowerCase()))) || lowercasemessage.startsWith(keyword.toLowerCase())){
                                if(custommessage.hasOwnProperty('RemainingUses')){
                                    msgMutex = await lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage));
                                    if(msgMutex == undefined){
                                        const unlock = await MutexCreator.lock();
                                        if(lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage)) == undefined){
                                            lockedMessages.set(message.channel.id + '.' + element.Messages.indexOf(custommessage), new Mutex());
                                        }
                                        unlock();
                                        msgMutex = lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage));
                                    }
                                    const unlockMsg = await msgMutex.lock();
                                    if(custommessage.RemainingUses == 0) {unlockMsg(); return}
                                    if(custommessage.RemainingUses > 0) {
                                        custommessage.RemainingUses = custommessage.RemainingUses - 1;
                                    }
                                    //fs.writeFileSync('./guilds/' + guild.ID + '.json', JSON.stringify(guild, null, 4));
                                    pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), CustomMessages);
                                    console.log(custommessage);
                                    unlockMsg();
                                }
                                if(custommessage.hasOwnProperty('Embeed')){
                                    const embeedmessage = new Discord.MessageEmbed().setFooter("Fapretbot");
                                    if(custommessage.Embeed.hasOwnProperty('Title')){
                                        embeedmessage.setTitle(custommessage.Embeed.Title);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('Description')){
                                        embeedmessage.setDescription(custommessage.Embeed.Description);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('color')){
                                        embeedmessage.setColor(custommessage.Embeed.color);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('Fields')){
                                        custommessage.Embeed.Fields.forEach(field => {
                                            embeedmessage.addField(field.name, field.value, field.inline);
                                        });
                                    }
                                    message.reply({embeds: [embeedmessage]});
                                }
                                if(custommessage.hasOwnProperty('Message')){
                                    message.Reply(custommessage.Message);
                                }
                                if(custommessage.hasOwnProperty('RandomComponent')){
                                    const componentAmount = Object.keys(custommessage.RandomComponent).length;
                                    var componentIndex = Math.floor(Math.random() * (componentAmount) + 1) - 1;
                                    if(custommessage.RandomComponent[componentIndex].hasOwnProperty('Embeed')){
                                        const embeedmessageComponent = new Discord.MessageEmbed().setFooter("Fapretbot");
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Title')){
                                            embeedmessageComponent.setTitle(custommessage.RandomComponent[componentIndex].Embeed.Title);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Description')){
                                            embeedmessageComponent.setDescription(custommessage.RandomComponent[componentIndex].Embeed.Description);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('color')){
                                            embeedmessageComponent.setColor(custommessage.RandomComponent[componentIndex].Embeed.color);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Fields')){
                                            custommessage.RandomComponent[componentIndex].Embeed.Fields.forEach(field => {
                                                embeedmessageComponent.addField(field.name, field.value, field.inline);
                                            });
                                        }
                                        message.reply({embeds: [embeedmessageComponent]});
                                    }
                                    if(custommessage.RandomComponent[componentIndex].hasOwnProperty('Message')){
                                        message.reply(custommessage.RandomComponent[componentIndex].Message);
                                    }
                                }
                            };
                        });
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}