
const Discord = require('discord.js');

module.exports = {
    name: 'sortearequipos.fn_sortearcanaldevoz',
    description: 'implementacion de sortear canal de voz',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_sortearcanaldevoz
}

async function fn_sortearcanaldevoz(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes permisos para poder usar este comando'});
        return;
    }
    let sorteoMessageData = {
        participantsAmount: 0,
        participants: [],
        participantsPerTeam: options.getInteger('jugadores_por_equipo')
    }
    if(options.getInteger('cant_equipos')){
        sorteoMessageData.teamAmount = options.getInteger('cant_equipos');
    }
    let voiceChannel = options.getChannel('canal');
    let hasOwner = options.getBoolean('caller_too') ?? true;
    if (!voiceChannel) {
        slashcommand.editReply({ content: 'El bot no pudo acceder al canal de voz!'});
        return;
    }
    if(voiceChannel.members.size == 0){
        slashcommand.editReply({ content: 'No hay jugadores en el canal de voz!'});
        return;
    }
    voiceChannel.members.forEach(element => {
        if((hasOwner || element.id != slashcommand.member.id) && (!sorteoMessageData.teamAmount || sorteoMessageData.teamAmount * sorteoMessageData.participantsPerTeam >= sorteoMessageData.participantsAmount)){
            sorteoMessageData.participants.push(element.user.id);
            sorteoMessageData.participantsAmount++;
        }
    });
    let copy = [], n = sorteoMessageData.participantsAmount, i;
    while (n > 0) {
        i = Math.floor(Math.random() * n);
        await copy.push(sorteoMessageData.participants[i]);
        sorteoMessageData.participants.splice(i,1);
        n--;
    }
    sorteoMessageData.participants = copy;
    let teamnumber = 0;
    for (let index = 0; index < sorteoMessageData.participantsAmount;) {
        teamnumber++;
        let text = `**Equipo ${teamnumber}**\n`;
        for (let index2 = index; index2 < index + sorteoMessageData.participantsPerTeam && index2 < sorteoMessageData.participantsAmount; index2++) {
            let element = sorteoMessageData.participants[index2];
            text += `<@${element}>\n`;
        }
        await slashcommand.channel.send(text);
        index = index + sorteoMessageData.participantsPerTeam;
    }
    slashcommand.editReply({ content: 'Sorteo finalizado'});
}