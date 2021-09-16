const config = require('./config.json');
const Discord = require('discord.js');
module.exports = {
    name: 'music.help',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild){
        const embeed = new Discord.MessageEmbed()
        .setColor(config.Embeed.color)
        .setTitle(config.Messages['help-title'])
        .setDescription(config.Messages['help-description'])
        .setFooter("trymate bot by Fapret");
        config.Messages['help-commands'].forEach(element => {
            embeed.addField(element.title, element.description);
        });
        message.channel.send({embeeds: [embeed]});
    }
}
