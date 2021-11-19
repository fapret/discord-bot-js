const config = require('./config.json');

module.exports = {
    name: 'music.shuffle',
    description: 'modulo de musica, comando shuffle',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        var copy = [], copyVotes = [], n = queue.songs.length, i;
        copy.push(queue.songs[0]);
        if(queue.skipVotes[0] == null){
            queue.skipVotes[0] = []
        }
        copyVotes[0] = queue.skipVotes[0];
        delete queue.songs[0];
        delete queue.skipVotes[0];
        n--;
        while (n) {
            i = Math.floor(Math.random() * queue.songs.length);
            if (i in queue.songs) {
                copy.push(queue.songs[i]);
                if(queue.skipVotes[i] == null){
                    queue.skipVotes[i] = []
                }
                copyVotes.push(queue.skipVotes[i]);
                delete queue.songs[i];
                delete queue.skipVotes[i];
                n--;
            }
        }
        queue.songs = copy;
        queue.skipVotes = copyVotes;
        message.reply(config.Messages['shuffled-correctly']);
    }
}