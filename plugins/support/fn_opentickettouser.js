const Discord = require('discord.js');

module.exports = {
    name: 'support.fn_opentickettouser',
    description: 'implementacion de fn_opentickettouser',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_opentickettouser
}

async function fn_opentickettouser(dataManager, slashcommand){
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.reply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let category = options.getChannel('category')?.id;
    let modrole = options.getRole('modrole')?.id;
    let modal = new Discord.ModalBuilder();
    modal.setCustomId('support'+slashcommand.id);
    modal.setTitle('Crear ticket');
    let ticketinfo = {index: -1, supportID: -1, author: options.getUser('user').id, authorName: options.getUser('user').username, modrole: modrole, topic: undefined, category: category};
    let pluginManager = dataManager.PluginDataManager;
    pluginManager.writeData('cache/' + slashcommand.id, ticketinfo); //TODO use CacheDataManager
    let topic = new Discord.TextInputBuilder();
    topic.setCustomId('topic');
    topic.setLabel("Reason?");
    topic.setStyle(Discord.TextInputStyle.Paragraph);
    topic.setMaxLength(1000);
    topic.setValue('Other');
    let actionRow = new Discord.ActionRowBuilder().addComponents(topic);
    modal.addComponents(actionRow);
    await slashcommand.showModal(modal);
}