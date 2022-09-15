/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const ytdl = require('play-dl');
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
            if(message.editReply)
                message.editReply(config.Messages['must-be-on-voice-channel']);
            else
                message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        if(!voiceChannel.permissionsFor(message.client.user).has('CONNECT') || !voiceChannel.permissionsFor(message.client.user).has('SPEAK')){
            if(message.editReply)
                message.editReply(config.Messages['bot-not-allowed-in-your-channel']);
            else
                message.reply(config.Messages['bot-not-allowed-in-your-channel']);
            return;
        }
        if((queue.voiceChannel != null) && (voiceChannel.id != queue.voiceChannel.id)){
            if(message.editReply)
                message.editReply(config.Messages['bot-is-busy']);
            else
                message.reply(config.Messages['bot-is-busy']);
            return;
        }
        if(args.length == 1){
            if(message.editReply)
                message.editReply(config.Messages['must-specify-song']);
            else
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
            if(message.editReply)
                message.editReply(config.Messages['video-not-found']);
            else
                message.reply(config.Messages['video-not-found']);
            return;
        }
        var video = videolist[0];
        await playVideo(video, true, queue, voiceChannel, message);
        if(videolist[1] != null){
            if(message.editReply)
                message.editReply(config.Messages['playlist-added-to-queue'] + videolist[1].title);
            else
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
    let resource = await ytdl.stream(song.url, {discordPlayerCompatibility: true});
    const stream = createAudioResource(resource.stream);
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
                if(message.editReply)
                    message.editReply(config.Messages['start-music']);
                else
                    message.reply(config.Messages['start-music']);
                playmusic(queue, queue.songs[0]);
            } catch (err){
                console.log(err);
            }
        } else {
            queue.songs.push(song);
            if(sayAddedToQueue){
                if(message.editReply)
                    message.editReply(config.Messages['song-added-to-queue'][0] + song.title + config.Messages['song-added-to-queue'][1]);
                else
                    message.reply(config.Messages['song-added-to-queue'][0] + song.title + config.Messages['song-added-to-queue'][1]);
            }
        }
    }
}