const {fn_setoperatorrole} = require('./fn_setoperatorrole.js');
const {fn_setpluginenable} = require('./fn_setpluginenable.js');

const Discord = require('discord.js');

module.exports = {
    name: 'config',
    description: 'Comandos de configuracion',
    author: 'fapret',
    version: '2.3.0.7e6a15565',
    category: 'moderation',
    globalSlashCommands: [
    {name: 'config', description: 'Edita la configuracion critica del bot', dm_permission: false, options: [
        {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setoperatorrole', description: 'Setea el rol de operador', options: [
            {type: Discord.ApplicationCommandOptionType.Role, name: 'role', description: 'Rol de operador', required: true}
        ]},
        {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'setpluginenable', description: 'Activa o desactiva un plugin', options: [
            {type: Discord.ApplicationCommandOptionType.String, name: 'plugin', description: 'Plugin a activar/desactivar', required: true},
            {type: Discord.ApplicationCommandOptionType.Boolean, name: 'enable', description: 'Estado de habilitacion del plugin', required: true}
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