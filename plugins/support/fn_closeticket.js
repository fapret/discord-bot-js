const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_closeticket',
    description: 'implementacion de fn_closeticket',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_closeticket
}

async function fn_closeticket(dataManager, button){
    let pluginManager = dataManager.PluginDataManager;
    let channel = button.channel;
    let ticketInfo = pluginManager.readData('ticket/' + button.channel.id);
    let tempuser2 = await channel.guild.members.fetch(button.member.id);
    if(!tempuser2.roles.cache.has(ticketInfo.modrole) && !tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await button.guild.fetchOwner() == button.member.id)){
        button.editReply({ content: 'No tienes permitido cerrar este ticket.'});
        return;
    }
    if(ticketInfo.supportID != -1 ) {
        let supportData = pluginManager.readData(ticketInfo.supportID);
        if(supportData.ticketsOpen === undefined)
            supportData.ticketsOpen = 0; //Added for retrocompatibility
        if(supportData.delete == true && supportData.ticketsOpen == 1){
            pluginManager.eraseData(ticketInfo.supportID);
        } else {
            supportData.ticketsOpen--;
            pluginManager.writeData(ticketInfo.supportID, supportData);
        }
    }
    pluginManager.eraseData('ticket/' + button.channel.id);
    channel.delete();
}