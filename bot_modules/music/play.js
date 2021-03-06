const ytdl = require('ytdl-core');
const ytSearch = require('yt-search'); //TODO: Cambiarlo por otra libreria, ya que esta no es async
const config = require('./config.json');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionStatus,
    getVoiceConnection
} = require('@discordjs/voice');

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
            var resultado;
            if(query.startsWith("https://www.youtube.com/watch?v=")){
                try{
                    resultado = { videos: [], playlists: []};
                    resultado.videos[0] = await ytSearch({ videoId: query.slice(32,43) });
                    resultado.playlists[0] = null;
                } catch {
                    resultado = await ytSearch(query);
                }
            } else {
                resultado = await ytSearch(query);
            }
            if((resultado.playlists[0] != null) && query.includes("playlist")){
                var playlist = await ytSearch({ listId: resultado.playlists[0].listId });
                for(video of playlist.videos){
                    if(video.videoId != null){
                        var localurl = "https://www.youtube.com/watch?v=" + video.videoId;
                        video.url = localurl;
                    } else {
                        var index = playlist.videos.indexOf(video);
                        if (index > -1) {
                            playlist.videos.splice(index, 1);
                        }
                    }
                }
                if(playlist.videos == [] || playlist.videos == null){
                    playlist = null;
                }
            } else {
                var playlist = null;
            }
            return (resultado.videos.length >= 1) ? [resultado.videos[0], playlist] : null;
        }
        args.shift();
        var videolist = await videobusqueda(args.join(' '));
        if(videolist == null || (videolist[0] == null && videolist[1] == null)){
            message.reply(config.Messages['video-not-found']);
            return;
        }
        var video = videolist[0];
        await playVideo(video, true, queue, voiceChannel, message);
        if(videolist[1] != null){
            message.reply(config.Messages['playlist-added-to-queue'] + videolist[1].title);
            for(video of videolist[1].videos){
                await playVideo(video, false, queue, voiceChannel, message);
            }
        }
    }
}

const playmusic = async function(queue, song){
    if(!song){
       	getVoiceConnection(queue.voiceChannel.guild.id).destroy();
        queue.voiceChannel = null;
        queue.textChannel = null;
        queue.songs = [];
        queue.skipVotes = [];
        queue.conection = null;
        queue.suscription = null;
        if(queue.player != null){
            queue.player.stop();
        }
        queue.player = null;
        return;
    }
    const stream = createAudioResource(ytdl(song.url, {filter: 'audioonly'}));
    if(!queue.suscription){
        queue.suscription = queue.conection.subscribe(queue.player);
        queue.player.play(stream);
        queue.player.on(AudioPlayerStatus.Idle, () => {
            queue.status = "Idle";
            queue.songs.shift();
            queue.skipVotes.shift();
            playmusic(queue, queue.songs[0]);
        });
    } else {
        queue.player.play(stream);
    }
    queue.player.on(AudioPlayerStatus.Paused, () => {
        queue.status = "Paused";
    });
    queue.player.on(AudioPlayerStatus.Playing, () => {
        queue.status = "Playing";
    });
    queue.player.on(AudioPlayerStatus.Bufferring, () => {
        queue.status = "Bufferring";
    });
    queue.player.on(AudioPlayerStatus.AutoPaused, () => {
        queue.status = "AutoPaused";
    });
    queue.textChannel.send(config.Messages['now-playing'] + song.title);
}

const playVideo = async function(video, sayAddedToQueue, queue, voiceChannel, message){
    if(video){
        let song = {
            title: video.title,
            url: video.url
        };
        if(queue.conection == null){
            try{
                const conexion = await joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: voiceChannel.guild.id,
                    adapterCreator: voiceChannel.guild.voiceAdapterCreator
                });
                await entersState(conexion, VoiceConnectionStatus.Ready, 30e3);
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
        if(queue.player == null){
            const player = createAudioPlayer();
            queue.player = player;
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
            if(sayAddedToQueue){
                message.reply(config.Messages['song-added-to-queue'][0] + song.title + config.Messages['song-added-to-queue'][1]);
            }
        }
    }
}