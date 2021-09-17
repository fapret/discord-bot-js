const config = require('./config.json');

module.exports = {
    name: 'music.pause',
    description: 'modulo de musica, comando pause',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        if(queue.status == "Playing"){
            queue.player.pause();
        } else {
            message.reply(config.Messages['cant-pause']);
        }
    }
}