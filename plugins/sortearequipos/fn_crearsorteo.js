/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');
const { ButtonStyle } = require('discord.js');

module.exports = {
    name: 'sortearequipos.fn_crearsorteo',
    description: 'implementacion de crearsorteo',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    fn_crearsorteo
}

async function fn_crearsorteo(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes permisos para poder usar este comando'});
        return;
    }

    sorteoMessageData = {
        participantsAmount: 0,
        participants: [],
        participantsPerTeam: options.getInteger('jugadores_por_equipo')
    }

    let message = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
    message.setTitle("Sorteo de equipos");
    if(options.getInteger('cant_equipos')){
        sorteoMessageData.teamAmount = options.getInteger('cant_equipos');
        message.setDescription("Participa para el sorteo de jugadores en " + options.getInteger('cant_equipos') + " con " + options.getInteger('jugadores_por_equipo') + ` por equipo.\nParticipantes: **${sorteoMessageData.participantsAmount}**`);
    } else {
        message.setDescription("Participa para el sorteo de jugadores con " + options.getInteger('jugadores_por_equipo') + ` por equipo.\nParticipantes: **${sorteoMessageData.participantsAmount}**`);
    }
    let row = new Discord.ActionRowBuilder();
    let button = new Discord.ButtonBuilder();
    button.setStyle(ButtonStyle.Primary);
    button.setLabel('Participar');
    button.setCustomId('sortearequipos_participate');
    button.setEmoji('📩');
    let button2 = new Discord.ButtonBuilder();
    button2.setStyle(ButtonStyle.Success);
    button2.setLabel('Sortear');
    button2.setCustomId('sortearequipos_sortear');
    button2.setEmoji('❗');
    row.addComponents([button, button2]);
    let embeedgiveaway = await slashcommand.channel.send({embeds: [message]});
    slashcommand.editReply({ content: 'Mensaje de sorteo de equipos creado'});
    sorteoMessageData.id = embeedgiveaway.id;
    pluginManager = dataManager.PluginDataManager;
    pluginManager.writeData(embeedgiveaway.id, sorteoMessageData);
    embeedgiveaway.edit({embeds: [message], components: [row]});
}