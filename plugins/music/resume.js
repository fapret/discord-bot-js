const config = require('./config.json');

module.exports = {
    name: 'music.resume',
    description: 'modulo de musica, comando resume',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        if(queue.status == "Paused"){
            queue.player.unpause();
            message.reply(config.Messages['resumed']);
        } else {
            message.reply(config.Messages['cant-unpause']);
        }
    }
}