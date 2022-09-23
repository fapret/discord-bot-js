/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

/*
ESTE PLUGIN ESTA OBSOLETO, NO USAR PARA PRODUCCION
ESTA PROGRAMADO PARA SER USADO EN POCOS SERVIDORES
USANDOLO EN MUCHOS SERVIDORES CAUSARA LAG EN EL BOT
--EL PLUGIN NO RECIBE SOPORTE--
*/

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
    version: '2.2.0.7e6814d',
    slashCommands : [
        {name: 'play', description: 'Reproduce una cancion o una playlist', options: [{type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'search', description: 'Nombre o url de la cancion', required: true}]},
        {name: 'stop', description: 'Para el reproductor de musica', options: []},
        {name: 'shuffle', description: 'Mezcla las canciones en la lista de reproduccion', options: []},
        {name: 'queue', description: 'Muestra las canciones en la lista de reproduccion y la cancion que se esta reproduciendo', options: []}
    ],
    async onMessage(message, dataManager, args){
        if(!globalqueue.has(dataManager.GuildDataManager.getGuildID())){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: [],
                player: null,
                suscription: null
            };
            globalqueue.set(dataManager.GuildDataManager.getGuildID(), queue_build);
        }
        const queue = globalqueue.get(dataManager.GuildDataManager.getGuildID());
        if((queue.textChannel == message.channel.id) || (queue.textChannel == null)){
            switch (args[0]) {
                case 'play':
                    play.execute(message, queue, args);
                    break;
                case 'stop':
                    stop.execute(message, queue, dataManager);
                    break;
                case 'forceskip':
                    forceskip.execute(message, queue, dataManager);
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
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        guilddata = dataManager.GuildDataManager;
        if(!globalqueue.has(guilddata.getGuildID())){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: [],
                player: null,
                suscription: null
            };
            globalqueue.set(guilddata.getGuildID(), queue_build);
        }
        const queue = globalqueue.get(guilddata.getGuildID());
        switch (slashcommand.commandName){
            case 'play':
                await slashcommand.deferReply();
                play.execute(slashcommand, queue, ['play', options.getString('search')]);
                break;
            case 'stop':
                await slashcommand.deferReply();
                stop.execute(slashcommand, queue, dataManager);
                break;
            case 'forceskip':
                await slashcommand.deferReply();
                forceskip.execute(slashcommand, queue, dataManager);
                break;
            case 'skipindex':
                break;
            case 'skip':
                await slashcommand.deferReply();
                skip.execute(slashcommand, queue);
                break;
            case 'queue':
                await slashcommand.deferReply();
                queuejs.execute(slashcommand, queue);
                break;
            case 'pause':
                await slashcommand.deferReply();
                pause.execute(slashcommand, queue);
                break;
            case 'resume':
                await slashcommand.deferReply();
                resume.execute(slashcommand, queue);
                break;
            case 'shuffle':
                await slashcommand.deferReply();
                shuffle.execute(slashcommand, queue);
                break;
            default:
                break;
        }
    }
}