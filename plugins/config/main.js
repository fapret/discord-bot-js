const {fn_setoperatorrole} = require('./fn_setoperatorrole.js');
const {fn_setpluginenable} = require('./fn_setpluginenable.js');

const Discord = require('discord.js');

module.exports = {
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        if (slashcommand.commandName == 'config'){
           await slashcommand.deferReply({ ephemeral: true });
           switch (options.getSubcommand()){
            case 'setoperatorrole':
                fn_setoperatorrole(dataManager, slashcommand);
                break;
            case 'setpluginenable':
                fn_setpluginenable(dataManager, slashcommand);
                break;
            default:
                break;
           }
        }
    }
}