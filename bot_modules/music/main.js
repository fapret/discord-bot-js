const play = require('./play.js');
const stop = require('./stop.js');
const forceskip = require('./forceskip.js');
const skip = require('./skip.js');
const skipindex = require('./skipindex.js');
const queuejs = require('./queue.js');
const help = require('./help.js');
const config = require('./config.json');

const globalqueue = new Map();
module.exports = {
    name: 'music',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild, args){
        if(!globalqueue.has(guild.ID)){
            const queue_build = {
                voiceChannel: null,
                textChannel: null,
                conection: null,
                songs: [],
                skipVotes: []
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
                skipVotes: []
            };
            globalqueue.set(guild.ID, queue_build);
        };
        const queue = globalqueue.get(guild.ID);
        if((queue.voiceChannel != null) && (oldstate.channelID == queue.voiceChannel)){
            if(newstate.channelID != queue.voiceChannel){
                queue.skipVotes.forEach(element => {
                    if(element.includes(oldstate.id)){
                        element.splice(element.indexOf(oldstate.id), 1);
                    };
                });
                if(oldstate.channel.members.size == 1){
                    oldstate.channel.leave();
                    await queue.textChannel.send(config.Messages['stop-music']);
                    queue.songs = [];
                    queue.voiceChannel = null;
                    queue.textChannel = null,
                    queue.conection = null,
                    queue.skipVotes = [];
                }
            };
        };
    }
}