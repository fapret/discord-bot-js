const {fn_setoperatorrole} = require('./fn_setoperatorrole.js');
const {fn_setpluginenable} = require('./fn_setpluginenable.js');

const Discord = require('discord.js');

module.exports = {
    name: 'config',
    description: 'Comandos de configuracion',
    author: 'fapret',
    version: '2.2.1.7e69054b8',
    globalSlashCommands: [
    {name: 'config', description: 'Edita la configuracion critica del bot', options: [
        {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'setoperatorrole', description: 'Setea el rol de operador', options: [
            {type: Discord.Constants.ApplicationCommandOptionTypes.ROLE, name: 'role', description: 'Rol de operador', required: true}
        ]},
        {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'setpluginenable', description: 'Activa o desactiva un plugin', options: [
            {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'plugin', description: 'Plugin a activar/desactivar', required: true},
            {type: Discord.Constants.ApplicationCommandOptionTypes.BOOLEAN, name: 'enable', description: 'Estado de habilitacion del plugin', required: true}
        ]}
    ]}],
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