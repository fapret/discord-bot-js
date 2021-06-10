const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont('./bot_modules/welcome/DoHyeon-Regular.ttf', { family: 'Do-Hyeon'});
const Discord = require('discord.js');
const fs = require('fs');

function internalParser(text, member){
    text = text.replace('${tag}', member.user.tag);
    text = text.replace('${memberCount}', member.guild.memberCount);
    text = text.replace('${guild}', member.guild.name);
    text = text.replace('${joinDate}', member.joinedAt.toDateString());
    return text;
}

function getchannel(member){
    if(member.guild.systemChannel != undefined){
        return member.guild.systemChannel.id;
    } else {
        return null;
    }
}

module.exports = {
    name: 'welcome',
    description: 'modulo de bienvenida customizada',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild, args){
        return;
    },
    async voiceStateUpdate(guild, oldstate, newstate){
        return;
    },
    async OnMemberJoin(guild, member){
        if(!guild.hasOwnProperty('welcomeModule')){
            guild.welcomeModule = {
                imageUrl: "./bot_modules/welcome/default.png",
                imagesize: {
                    x: "1400",
                    y: "600"
                },
                strokeColor: "#00A9D3",
                channel: getchannel(member),
                avatar: {
                    x: "250",
                    y: "300",
                    radius: "150",
                    border: "0",
                    borderColor: "#FFFFFF"
                },
                texts: [
                    {text: "Bienvenid@ ${tag}", size: 80, x: "430", y: "300", font: "Do-Hyeon", color: "#00A9D3"},
                    {text: "Miembro ${memberCount}", size: 60, x: "570", y: "400", font: "sans-serif", color: "#00A9D3"}
                ],
                title: "",
                description: "",
                message: ""
            };
            fs.writeFileSync('./guilds/' + guild.ID + '.json', JSON.stringify(guild, null, 4));
            var guildread = fs.readFileSync('./guilds/' + guild.ID + '.json');
            guild = JSON.parse(guildread);
        }
        if(guild.welcomeModule.channel == null){
            return;
        };
        const img = new createCanvas(parseInt(guild.welcomeModule.imagesize.x), parseInt(guild.welcomeModule.imagesize.y));
        const context = img.getContext('2d');
        const background = await loadImage(guild.welcomeModule.imageUrl);
        context.drawImage(background, 0, 0, img.width, img.height);
        context.strokeStyle = guild.welcomeModule.strokeColor;
        context.strokeRect(0, 0, img.width, img.height);
        context.save();
        context.fillStyle = guild.welcomeModule.strokeColor;
        context.beginPath();
        context.arc(parseInt(guild.welcomeModule.avatar.x), parseInt(guild.welcomeModule.avatar.y), parseInt(guild.welcomeModule.avatar.radius), 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const memberAvatar = await loadImage(member.user.avatarURL({ format: "jpg" }));
        context.drawImage(memberAvatar, parseInt(guild.welcomeModule.avatar.x) - parseInt(guild.welcomeModule.avatar.radius), parseInt(guild.welcomeModule.avatar.y) - parseInt(guild.welcomeModule.avatar.radius), parseInt(guild.welcomeModule.avatar.radius) * 2, parseInt(guild.welcomeModule.avatar.radius) * 2);
        var name = member.user.tag;
        context.restore();
        guild.welcomeModule.texts.forEach(element => {
            context.fillStyle = element.color;
            var text = internalParser(element.text, member, guild);
            context.font = `${element.size}px ${element.font}`;
            while ((context.measureText(text).width >= img.width - parseInt(element.x)) || (context.measureText(text).height >= img.height - parseInt(element.y))){
                context.font = `${element.size -= 1}px ${element.font}`;
            };
            context.fillText(text, parseInt(element.x), parseInt(element.y));
        });

        const message = new Discord.MessageEmbed().setFooter("trymate bot by Fapret");
        if(guild.welcomeModule.title != ""){
            message.setTitle(guild.welcomeModule.title);
        }
        if(guild.welcomeModule.description != ""){
            message.setDescription(guild.welcomeModule.description);
        }
        const attach = new Discord.MessageAttachment(img.toBuffer(), `${member.user.id}.png`);
        message.attachFiles(attach);
        message.setImage(`attachment://${member.user.id}.png`);
        channel = member.guild.channels.resolve(guild.welcomeModule.channel);
        if(guild.welcomeModule.message != ""){
            await channel.send(internalParser(guild.welcomeModule.message));
        };
        channel.send(message);
    }
}