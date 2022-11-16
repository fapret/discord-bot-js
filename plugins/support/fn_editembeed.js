const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_editembeed',
    description: 'implementacion de fn_editembeed',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_editembeed
}

async function fn_editembeed(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    //TODO
}