const config = require('./config.json');
module.exports = {
    name: 'music.forceskip',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue, guild){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        } else if (!message.member.roles.cache.has(guild.operatorRole)){
            message.reply(config.Messages['only-operators-can-forceskip']);
            return;
        }
        if(queue.length == 0){
            await message.channel.send(config.Messages['no-songs-to-skip']);
            return;
        }
        queue.conection.dispatcher.end();
        await message.channel.send(config.Messages['skip-forced']);
    }
}