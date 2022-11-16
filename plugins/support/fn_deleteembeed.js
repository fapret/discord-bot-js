const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_deleteembeed',
    description: 'implementacion de fn_deleteembeed',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_deleteembeed
}

async function fn_deleteembeed(dataManager, slashcommand) {
    let pluginManager = dataManager.PluginDataManager;
    let channel = button.channel;
    let ticketInfo = pluginManager.readData('ticket/' + button.channel.id);
    let tempuser2 = await channel.guild.members.fetch(button.member.id);
    if(!tempuser2.roles.cache.has(ticketInfo.modrole) && !tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await button.guild.fetchOwner() == button.member.id)){
        button.editReply({ content: 'No tienes permitido cerrar este ticket.'});
        return;
    }
    //TODO
}