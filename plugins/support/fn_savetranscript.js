const Discord = require('discord.js');
const ejs = require('ejs');
const fs = require('fs');

const template = fs.readFileSync(__dirname + '/template.ejs', 'utf-8');

module.exports = {
    name: 'support.fn_savetranscript',
    description: 'implementacion de fn_savetranscript',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_savetranscript
}

async function fn_savetranscript(dataManager, button){
    let pluginManager = dataManager.PluginDataManager;
    let channel = button.channel;
    let ticketInfo = pluginManager.readData('ticket/' + button.channel.id);
    let tempuser2 = await button.channel.guild.members.fetch(button.member.id);
    if(!tempuser2.roles.cache.has(ticketInfo.modrole) && !tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await button.guild.fetchOwner() == button.member.id)){
        button.editReply({ content: 'No tienes permitido crear transcripciones de este ticket.'});
        return;
    }
    let messagesManager = channel.messages;
    let messages = [];
    let localmessages;
    let lastmessage;
    let ticket = {name: channel.name, guild: button.guild.name, topic: ticketInfo.topic, guildimg: "https://cdn.discordapp.com/icons/" + button.guild.id + "/" + button.guild.icon + ".jpg"};
    do{
        localmessages = await messagesManager.fetch({ limit: 100, before: lastmessage}).catch(err => console.log(err));
        lastmessage = localmessages.lastKey();
        messages = messages.concat(Array.from(localmessages.values()));
    }while(localmessages.size === 100);
    let transcript = await ejs.render(template, {ticket: ticket, messages: messages.reverse()});
    let transcriptchannelid = pluginManager.readData(button.guild.id);
    let transcriptchannel;
    if(transcriptchannelid != undefined){
        transcriptchannel = await button.guild.channels.fetch(transcriptchannelid);
    } else {
        transcriptchannel = channel;
    }
    let embeed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
    embeed.setTitle('Support');
    embeed.addFields({name: 'Topic', value: ticketInfo.topic, inline: true},{name: 'Usuario', value: '<@' + ticketInfo.author + '>', inline: true},{name: 'Categoria', value: '<#' + ticketInfo.category + '>', inline: true});
    let atc = new Discord.AttachmentBuilder(Buffer.from(transcript), {name: ticket.name + '.html'});
    await transcriptchannel.send({embeds: [embeed], files: [atc]});
    button.editReply({ content: 'Transcript generado.'});
}