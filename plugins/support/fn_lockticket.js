const Discord = require('discord.js');
const { ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'support.fn_lockticket',
    description: 'implementacion de fn_lockticket',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_lockticket
}

async function fn_lockticket(dataManager, button){
    let pluginManager = dataManager.PluginDataManager;
    let channel = button.channel;
    let ticketInfo = pluginManager.readData('ticket/' + button.channel.id);
    let tempuser2 = await channel.guild.members.fetch(button.member.id);
    if(!tempuser2.roles.cache.has(ticketInfo.modrole) && !tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await button.guild.fetchOwner() == button.member.id)){
        button.editReply({ content: 'No tienes permitido lockear este ticket.'});
        return;
    }

    let userid = ticketInfo.author;

    let row = new Discord.ActionRowBuilder();
    let button1 = new Discord.ButtonBuilder();
    button1.setStyle(ButtonStyle.Danger);
    button1.setLabel('Finalizar ticket');
    button1.setCustomId('supportclose');
    button1.setEmoji('📩');
    let button2 = new Discord.ButtonBuilder();
    button2.setStyle(ButtonStyle.Secondary);
    button2.setLabel('Crear transcripcion');
    button2.setCustomId('supporttranscript');
    button2.setEmoji('💾');
    let button3 = new Discord.ButtonBuilder();
    if(!ticketInfo.locked){
        ticketInfo.locked = true;
        channel.permissionOverwrites.edit(userid, { ViewChannel: false });
        button3.setStyle(ButtonStyle.Primary);
        button3.setLabel('Unlock ticket');
        button3.setCustomId('supportlock');
        button3.setEmoji('🔓');
        row.addComponents([button3, button2, button1]);
        button.message.edit({components: [row]});
        button.editReply("Ticket locked by: <@" + button.member.id + ">");
    } else {
        ticketInfo.locked = false;
        channel.permissionOverwrites.edit(userid, { ViewChannel: true });
        button3.setStyle(ButtonStyle.Primary);
        button3.setLabel('Lock ticket');
        button3.setCustomId('supportlock');
        button3.setEmoji('🔒');
        row.addComponents([button3, button2, button1]);
        button.message.edit({components: [row]});
        button.editReply("Ticket unlocked by: <@" + button.member.id + ">");
    }
    pluginManager.writeData('ticket/' + channel.id, ticketInfo);
}
