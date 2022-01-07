const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(__dirname + '/DoHyeon-Regular.ttf', { family: 'Do-Hyeon'});
registerFont(__dirname + '/Bebas-Regular.ttf', { family: 'Bebas'});
const Discord = require('discord.js');

function internalParser(text, member){
    text = text.replace('${tag}', member.user.tag);
    text = text.replace('${memberCount}', member.guild.memberCount);
    text = text.replace('${guild}', member.guild.name);
    text = text.replace('${joinDate}', member.joinedAt.toDateString());
    text = text.replace('${userid}', member.id);
    text = text.replace('${username}', member.user.username);
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
    async OnMemberJoin(dataManager, member){
        pluginManager = dataManager.PluginDataManager;
        welcomeModule = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
        if(!welcomeModule){
            welcomeModule = {
                imageUrl: __dirname + "/minecraft.png",
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
                    border: "5",
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
            pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), welcomeModule);
        }
        if(welcomeModule.channel == null){
            return;
        };
        const img = new createCanvas(parseInt(welcomeModule.imagesize.x), parseInt(welcomeModule.imagesize.y));
        const context = img.getContext('2d');
        const background = await loadImage(welcomeModule.imageUrl);
        context.drawImage(background, 0, 0, img.width, img.height);
        context.strokeStyle = welcomeModule.strokeColor;
        context.strokeRect(0, 0, img.width, img.height);
        context.save();
        context.fillStyle = welcomeModule.avatar.borderColor;
        context.beginPath();
        context.arc(parseInt(welcomeModule.avatar.x), parseInt(welcomeModule.avatar.y), parseInt(welcomeModule.avatar.radius) + parseInt(welcomeModule.avatar.border), 0, Math.PI * 2, true);
        context.closePath();
        context.fill();
        context.beginPath();
        context.arc(parseInt(welcomeModule.avatar.x), parseInt(welcomeModule.avatar.y), parseInt(welcomeModule.avatar.radius), 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        const memberAvatar = await loadImage(member.user.displayAvatarURL({ format: 'png', size: 1024}));
        context.drawImage(memberAvatar, parseInt(welcomeModule.avatar.x) - parseInt(welcomeModule.avatar.radius), parseInt(welcomeModule.avatar.y) - parseInt(welcomeModule.avatar.radius), parseInt(welcomeModule.avatar.radius) * 2, parseInt(welcomeModule.avatar.radius) * 2);
        context.restore();
        welcomeModule.texts.forEach(element => {
            context.fillStyle = element.color;
            if(element.hasOwnProperty('align')){
                context.textAlign = element.align;
            };
            var text = internalParser(element.text, member);
            context.font = `${element.size}px ${element.font}`;
            while ((context.measureText(text).width >= img.width - parseInt(element.x)) || (context.measureText(text).height >= img.height - parseInt(element.y))){
                context.font = `${element.size -= 1}px ${element.font}`;
            };
            context.fillText(text, parseInt(element.x), parseInt(element.y));
            context.textAlign = "start";
        });

        const message = new Discord.MessageEmbed().setFooter("FapretBot");
        if(welcomeModule.title != ""){
            message.setTitle(welcomeModule.title);
        }
        if(welcomeModule.description != ""){
            message.setDescription(internalParser(welcomeModule.description, member));
        }
        const attach = new Discord.MessageAttachment(img.toBuffer(), `${member.user.id}.png`);
        message.setImage(`attachment://${member.user.id}.png`);
        channel = member.guild.channels.resolve(welcomeModule.channel);
        if(welcomeModule.message != ""){
            await channel.send(internalParser(welcomeModule.message, member));
        };
        channel.send({embeds: [message], files: [attach]});
    }
}