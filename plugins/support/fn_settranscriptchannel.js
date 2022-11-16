const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_settranscriptchannel',
    description: 'implementacion de fn_settranscriptchannel',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_settranscriptchannel
}

async function fn_settranscriptchannel(dataManager, slashcommand){
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let canal = options.getChannel('canal');
    let pluginManager = dataManager.PluginDataManager;
    pluginManager.writeData(slashcommand.guild.id, canal.id);
    slashcommand.editReply({ content: 'Canal de transcripciones seteado'});
}