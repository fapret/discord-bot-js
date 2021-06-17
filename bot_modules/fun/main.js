const avatar = require('./avatar.js');
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
            default:
                message.reply(config.Messages['no-action']);
                break;
        }
    },
    async voiceStateUpdate(guild, oldstate, newstate){
        return;
    },
    async OnMemberJoin(guild, member){
        return;
    },
    async onButtonClick(guild, button){
        return;
    }
}