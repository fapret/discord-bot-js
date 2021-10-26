const avatar = require('./avatar.js');
const hug = require('./hug.js');
const config = require('./config.json');

module.exports = {
    name: 'fun',
    description: 'modulo de diversion',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, guild, args){
        switch (args[0]){
            case 'avatar':
                avatar.execute(message);
                break;
            case 'hug':
                hug.execute(message, args);
                break;
            default:
                message.reply(config.Messages['no-action']);
                break;
        }
    }
}