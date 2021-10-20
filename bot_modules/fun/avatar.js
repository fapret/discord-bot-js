const Discord = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
    name: 'fun.avatar',
    description: 'modulo de diversion',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message){
        const img = new createCanvas(1024, 1024);
        const context = img.getContext('2d');
        var member = message.mentions.users.first();
        if (member == undefined){
            member = message.author;
        }
        const memberAvatarURL = member.displayAvatarURL({ format: 'png', size: 1024});
        const memberAvatar = await loadImage(memberAvatarURL);
        context.drawImage(memberAvatar, 0, 0, 1024, 1024);
        const embeed = new Discord.MessageEmbed().setFooter("FapretBot");
        const attach = new Discord.MessageAttachment(img.toBuffer(), `${member.id}.png`);
        embeed.setImage(`attachment://${member.id}.png`);
        embeed.setURL(memberAvatarURL);
        embeed.setDescription(`[URL Avatar](${memberAvatarURL}) | ID: ${member.id}`);
        embeed.setAuthor(`${member.tag}`, memberAvatarURL);
        message.channel.send({embeds: [embeed], files: [attach]});
    }
}
