const config = require('./config.json');
module.exports = {
    name: 'music.skipindex',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue, args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        args.shift();
        args[0] = parseInt(args[0]);
        if((args.length == 0) || (args[0] < 1) || !Number.isInteger(args[0])){
            message.reply(config.Messages['must-specify-index']);
            return;
        }
        if((queue.songs.length < 2) || (queue.songs.length - 1 < args[0])){
            message.channel.send(config.Messages['no-songs-to-skip']);
            return;
        }
        const member = message.member.id;
        if(queue.skipVotes[args[0]] == null){
            queue.skipVotes[args[0]] = [];
        }
        var memberID = queue.skipVotes[args[0]].find(element => element == member);
        if(!memberID){
            queue.skipVotes[args[0]].push(member);
            message.reply(config.Messages['skip-vote-sent']);
        } else {
            message.reply(config.Messages['already-skip-voted']);
            return;
        }
        membersPlaying = voiceChannel.members.size;
        if((membersPlaying/2) <= queue.skipVotes[args[0]].length){
            songTitle = queue.songs[args[0]].title;
            queue.songs.splice(args[0], 1);
            queue.skipVotes.splice(args[0], 1);
            message.channel.send(config.Messages['queue-song-skipped'] + songTitle);
        }
    }
}