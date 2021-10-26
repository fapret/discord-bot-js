const play = require('./play.js');
const stop = require('./stop.js');
const forceskip = require('./forceskip.js');
const skip = require('./skip.js');
const skipindex = require('./skipindex.js');
const queuejs = require('./queue.js');
const help = require('./help.js');
const pause = require('./pause.js');
const resume = require('./resume.js');
const shuffle = require('./shuffle.js');
const config = require('./config.json');
const Discord = require('discord.js');
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

const globalqueue = new Map();
module.exports = {
    name: 'music',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    slashCommands : [
        {name: 'play', description: 'Reproduce una cancion o una playlist', options: [{type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'search', description: 'Nombre o url de la cancion', required: true}]},
        {name: 'stop', description: 'Para el reproductor de musica', options: []},
        {name: 'shuffle', description: 'Mezcla las canciones en la lista de reproduccion', options: []},
        {name: 'queue', description: 'Muestra las canciones en la lista de reproduccion y la cancion que se esta reproduciendo', options: []}
    ],
    async execute(message, guild, args){
        if(!globalqueue.has(guild.ID)){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: [],
                player: null,
                suscription: null
            };
            globalqueue.set(message.guild.id, queue_build);
        }
        const queue = globalqueue.get(guild.ID);
        if((queue.textChannel == message.channel.id) || (queue.textChannel == null)){
            switch (args[0]) {
                case 'play':
                    play.execute(message, queue, args);
                    break;
                case 'stop':
                    stop.execute(message, queue, guild);
                    break;
                case 'forceskip':
                    forceskip.execute(message, queue, guild);
                    break;
                case 'skipindex':
                    skipindex.execute(message, queue, args);
                    break;
                case 'skip':
                    skip.execute(message, queue);
                    break;
                case 'queue':
                    queuejs.execute(message, queue);
                    break;
                case 'help':
                    help.execute(message, queue);
                    break;
                case 'pause':
                    pause.execute(message, queue);
                    break;
                case 'resume':
                    resume.execute(message, queue);
                    break;
                case 'shuffle':
                    shuffle.execute(message, queue);
                    break;
                default:
                    message.reply(config.Messages['no-action']);
                    break;
            }
        } else {
            message.reply(config.Messages['bot-is-busy']);
        }
    },
    async voiceStateUpdate(guild, oldstate, newstate){
        if(!globalqueue.has(guild.ID)){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: [],
                player: null,
                suscription: null
            };
            globalqueue.set(guild.ID, queue_build);
        };
        const queue = globalqueue.get(guild.ID);
        if((queue.voiceChannel != null) && (oldstate.channel.id == queue.voiceChannel)){
            if(newstate.channelID != queue.voiceChannel){
                queue.skipVotes.forEach(element => {
                    if(element.includes(oldstate.id)){
                        element.splice(element.indexOf(oldstate.id), 1);
                    };
                });
                if(oldstate.channel.members.size == 1){
                    queue.suscription.unsubscribe();
                    getVoiceConnection(oldstate.channel.guild.id).destroy();
                    await queue.textChannel.send(config.Messages['stop-music']);
                    queue.songs = [];
                    queue.voiceChannel = null;
                    queue.textChannel = null;
                    queue.conection = null;
                    queue.suscription = null;
                    queue.skipVotes = [];
                    if(queue.player != null){
                        queue.player.stop();
                    }
                    queue.player = null;
                }
            };
        };
    },
    async onSlashCommand(guild, slashcommand){
        const {options} = slashcommand;
        if(!globalqueue.has(guild.ID)){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: [],
                player: null,
                suscription: null
            };
            globalqueue.set(message.guild.id, queue_build);
        }
        const queue = globalqueue.get(guild.ID);
        switch (slashcommand.commandName){
            case 'play':
                play.execute(slashcommand, queue, ['play', options.getString('search')]);
                break;
            case 'stop':
                stop.execute(slashcommand, queue, guild);
                break;
            case 'forceskip':
                break;
            case 'skipindex':
                break;
            case 'skip':
                break;
            case 'queue':
                queuejs.execute(slashcommand, queue);
                break;
            case 'pause':
                break;
            case 'resume':
                break;
            case 'shuffle':
                shuffle.execute(slashcommand, queue);
                break;
            default:
                break;
        }
    }
}