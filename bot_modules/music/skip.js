const config = require('./config.json');
module.exports = {
    name: 'music.skip',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        if(queue.songs.length == 0){
            await message.channel.send(config.Messages['no-songs-to-skip']);
            return;
        }
        const member = message.member.id;
        if(queue.skipVotes[0] == null){
            queue.skipVotes[0] = [];
        }
        var memberID = queue.skipVotes[0].find(element => element == member);
        if(!memberID){
            queue.skipVotes[0].push(member);
            await message.reply(config.Messages['skip-vote-sent']);
        } else {
            await message.reply(config.Messages['already-skip-voted']);
            return;
        }
        membersPlaying = voiceChannel.members.size;
        if((membersPlaying/2) <= queue.skipVotes[0].length){
            queue.conection.dispatcher.end();
            await message.channel.send(config.Messages['song-skipped']);
        }
    }
}