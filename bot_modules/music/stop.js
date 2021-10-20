const config = require('./config.json');
const {
    getVoiceConnection
} = require('@discordjs/voice');
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
        queue.suscription.unsubscribe();
        getVoiceConnection(message.guild.id).destroy();
        queue.songs = [];
        queue.voiceChannel = null;
        queue.textChannel = null,
        queue.conection = null,
        queue.skipVotes = [];
        queue.status = null;
        queue.suscription = null;
        if(queue.player != null){
            queue.player.stop();
        }
        queue.player = null;
        message.channel.send(config.Messages['stop-music']);
    }
}