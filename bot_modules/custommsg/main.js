const Discord = require('discord.js');
const fs = require('fs');
module.exports = {
    name: 'custommsg',
    description: 'modulo de mensajes customizados',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild, args){
        try{
            lowercasemessage = message.content.toLowerCase();
            if(!guild.hasOwnProperty('CustomMessages')){
                guild.CustomMessages = [];
                fs.writeFileSync('./guilds/' + guild.ID + '.json', JSON.stringify(guild, null, 4));
                var guildread = fs.readFileSync('./guilds/' + guild.ID + '.json');
                guild = JSON.parse(guildread);
            }
            guild.CustomMessages.forEach(element => {
                if(element.Channel == message.channel.id){
                    element.Messages.forEach(custommessage => {
                        custommessage.Keywords.forEach(keyword => {
                            if(((custommessage.WildCard == true) && (lowercasemessage.includes(keyword.toLowerCase()))) || lowercasemessage.startsWith(keyword.toLowerCase())){
                                if(custommessage.hasOwnProperty('Embeed')){
                                    const embeedmessage = new Discord.MessageEmbed().setFooter("trymate bot by Fapret");
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
                                    message.lineReply(embeedmessage);
                                }
                                if(custommessage.hasOwnProperty('Message')){
                                    message.lineReply(custommessage.Message);
                                }
                            };
                        });
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    },
    async voiceStateUpdate(guild, oldstate, newstate){
        return;
    }
}