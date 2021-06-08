const config = require('./config.json');
module.exports = {
    name: 'music.stop',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue, guild){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        } else if (!message.member.roles.cache.has(guild.operatorRole)){
            message.reply(config.Messages['only-operators-can-stop']);
            return;
        }
        await voiceChannel.leave();
        queue.songs = [];
        queue.voiceChannel = null;
        queue.textChannel = null,
        queue.conection = null,
        queue.skipVotes = [];
        await message.channel.send(config.Messages['stop-music']);
    }
}