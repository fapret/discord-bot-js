const config = require('./config.json');
const Discord = require('discord.js');
module.exports = {
    name: 'music.queue',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        if(queue.length == 0){
            await message.channel.send(config.Messages['no-songs-on-queue']);
            return;
        }
        var songs = "```\n";
        var songAmount = -1;
        var playing;
        queue.songs.forEach(element => {
            songAmount++;
            if(songAmount == 0){
                playing = element.title;
            } else {
                songs += songAmount + ". " + element.title + "\n";
            }
        });
        songs += "```";
        if(songAmount == 0){
            songs = config.Messages['no-songs-on-queue'];
        }
        const embeed = new Discord.MessageEmbed()
        .setColor(config.Embeed.color)
        .setTitle(config.Messages['songs-list'])
        .setDescription(songs)
        .setFooter("trymate bot by Fapret")
        .addFields({name: config.Messages['now-playing'], value: playing});
        message.channel.send(embeed);
    }
}