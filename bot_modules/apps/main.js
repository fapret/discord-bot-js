const config = require('./config.json');
const Discord = require('discord.js');
const {MessageButton} = require('discord-buttons');
const fetch = require('node-fetch');

function internalParser(text, member, voiceChannel){
    if (member != null){
        text = text.replace('${tag}', member.user.tag);
        text = text.replace('${memberCount}', member.guild.memberCount);
        text = text.replace('${guild}', member.guild.name);
        text = text.replace('${joinDate}', member.joinedAt.toDateString());
        text = text.replace('${userid}', member.id);
        text = text.replace('${username}', member.user.username);
    }
    if(voiceChannel != null){
        text = text.replace('${voiceChannelID}', voiceChannel.id);
    }
    return text;
};

async function getInvite(appID, voiceChannel) {
    var code;
    await fetch(`https://discord.com/api/v8/channels/${voiceChannel.id}/invites`, {
        method: 'POST',
        body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: appID,
            target_type: 2,
            temporary: false,
            validate: null
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${config.Token}`
        }
    }).then(res => res.json()).then(Data => {
        if (Data.error || !Data.code) {
            console.log(Data);
            throw new Error('No se pudo obtener el enlace');
        };
        code = Data.code;
    });
    return `https://discord.com/invite/${code}`;
};

module.exports = {
    name: 'apps',
    description: 'modulo de apps',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild, args) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        try {
            var Apps = [];
            for (App of config.Apps) {
                let application = new MessageButton();
                application.setStyle('url');
                application.setLabel(App.Name);
                application.setEmoji(App.Emoji);
                var url = await getInvite(App.ID, voiceChannel);
                application.setURL(url);
                Apps.push(application);
            };

            const embeedmessage = new Discord.MessageEmbed().setFooter("trymate bot by Fapret");
            embeedmessage.setTitle(config.Embeed.title);
            embeedmessage.setColor(config.Embeed.color);
            embeedmessage.setDescription(internalParser(config.Embeed.Description, message.member, voiceChannel));

            message.channel.send({
                embed: embeedmessage,
                buttons: Apps
            });
        } catch (err) {
            console.log(err);
        }
    },
    async voiceStateUpdate(guild, oldstate, newstate) {
        return;
    },
    async OnMemberJoin(guild, member) {
        return;
    },
    async onButtonClick(guild, button) {
        return;
    }
}