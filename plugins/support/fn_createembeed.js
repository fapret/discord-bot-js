const Discord = require('discord.js');
const { ButtonStyle } = require('discord.js');

module.exports = {
    name: 'support.fn_createembeed',
    description: 'implementacion de fn_createembeed',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_createembeed
}

async function fn_createembeed(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let message2 = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
    if(options.getString('title')){
        message2.setTitle(options.getString('title'));
    } else {
        message2.setTitle('Support');
    }
    message2.setDescription(options.getString('text'));
    let row = new Discord.ActionRowBuilder();
    let button = new Discord.ButtonBuilder();
    button.setStyle(ButtonStyle.Primary);
    button.setLabel('Crear Ticket');
    button.setCustomId('supportbtn');
    button.setEmoji('📩');
    row.addComponents([button]);
    slashcommand.channel.send({embeds: [message2], components: [row]});
    slashcommand.editReply({ content: 'Mensaje de soporte creado'});
}