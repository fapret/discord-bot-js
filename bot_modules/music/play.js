const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const config = require('./config.json');
module.exports = {
    name: 'music.play',
    description: 'modulo de musica, comando play',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue, args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        if(!voiceChannel.permissionsFor(message.client.user).has('CONNECT') || !voiceChannel.permissionsFor(message.client.user).has('SPEAK')){
            message.reply(config.Messages['bot-not-allowed-in-your-channel']);
            return;
        }
        if((queue.voiceChannel != null) && (voiceChannel.id != queue.voiceChannel.id)){
            message.reply(config.Messages['bot-is-busy']);
            return;
        }
        if(args.length == 1){
            message.reply(config.Messages['must-specify-song']);
            return;
        }
        const videobusqueda = async (query) => {
            const resultado = await ytSearch(query);
            return (resultado.videos.length > 1) ? resultado.videos[0] : null;
        }
        args.shift();
        var video = await videobusqueda(args.join(' '));
        if(video){
            let song = {
                title: video.title,
                url: video.url
            }
            if(queue.conection == null){
                try{
                    const conexion = await voiceChannel.join();
                    queue.conection = conexion;
                } catch (err){
                    console.log(config.Messages['error-at-connect']);
                    console.log(err);
                }
            }
            if(queue.voiceChannel == null){
                queue.voiceChannel = voiceChannel;
            }
            if(queue.textChannel == null){
                queue.textChannel = message.channel;
            }
            if(queue.songs.length == 0){
                queue.songs.push(song);
                try{
                    playmusic(queue, queue.songs[0]);
                } catch (err){
                    console.log(err);
                }
            } else {
                queue.songs.push(song);
                message.reply(config.Messages['song-added-to-queue'][0] + song.title + config.Messages['song-added-to-queue'][1])
            }
        } else {
            message.reply(config.Messages['video-not-found']);
        }
    }
}

const playmusic = async (queue, song) => {
    if(!song){
        queue.voiceChannel.leave();
        queue.voiceChannel = null;
        queue.textChannel = null;
        queue.songs = [];
        queue.conection = null;
        return;
    }
    const stream = ytdl(song.url, {filter: 'audioonly'});
    queue.conection.play(stream, {seek: 0, volume: 1}).on('finish', () => {
        queue.songs.shift();
        queue.skipVotes.shift();
        playmusic(queue, queue.songs[0]);
    });
    await queue.textChannel.send(config.Messages['now-playing'] + song.title);
}