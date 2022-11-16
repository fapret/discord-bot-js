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

const {fn_crearsorteo} = require('./fn_crearsorteo.js');
const {fn_sortearcanaldevoz} = require('./fn_sortearcanaldevoz.js');

//TODO: ARREGLAR PROBLEMA UNDEFINED ES USUARIO 

module.exports = {
    name: 'sortearequipos',
    description: 'Sortea los jugadores que ingresen al sorteo entre diferentes equipos',
    author: 'fapret',
    version: '2.3.0.7e6a15565',
    category: 'entertainment',
    globalSlashCommands: [
        {name: 'sortearequipos', description: 'Sistema de sorteo de equipos', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'crearsorteo', description: 'Crea un sorteo de equipos', options: [
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'jugadores_por_equipo', description: 'Jugadores Por equipo', choices: [
                    {name: 'duo', value: 2}, {name: '3_man_squad', value: 3}, {name: '4_man_squad', value: 4}, {name: '5_man_squad', value: 5}, {name: '6_man_squad', value: 6}, {name: '7_man_squad', value: 7}, {name: '8_man_squad', value: 8}
                ], required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'cant_equipos', description: 'Maxima cantidad de equipos'}
            ]},
            {type: Discord.ApplicationCommandOptionType.Subcommand, name: 'sortearcanal', description: 'Sortea los jugadores en el canal de voz', options: [
                {type: Discord.ApplicationCommandOptionType.Channel, name: 'canal', description: 'Canal de voz en el que se sortean los jugadores', channel_types: ['2'], required: true},
                {type: Discord.ApplicationCommandOptionType.Integer, name: 'jugadores_por_equipo', description: 'Jugadores Por equipo', choices: [
                    {name: 'duo', value: 2}, {name: '3_man_squad', value: 3}, {name: '4_man_squad', value: 4}, {name: '5_man_squad', value: 5}, {name: '6_man_squad', value: 6}, {name: '7_man_squad', value: 7}, {name: '8_man_squad', value: 8}
                ], required: true},
                {type: Discord.ApplicationCommandOptionType.Boolean, name: 'caller_too', description: 'Se te debe incluir?'}
            ]}
        ]}
    ],
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        if (slashcommand.commandName == 'sortearequipos'){
           switch (options.getSubcommand()){
            case 'crearsorteo':
                await slashcommand.deferReply({ ephemeral: true });
                fn_crearsorteo(dataManager, slashcommand);
                break;
            case 'sortearcanal':
                await slashcommand.deferReply({ ephemeral: true });
                fn_sortearcanaldevoz(dataManager, slashcommand);
                break;
            default:
                break;
           }
        }
    },
    async onButtonClick(dataManager, button){
        let participantid;
        let pluginManager = dataManager.PluginDataManager;
        let giveawayMessageData;
        switch(button.customId){
            case 'sortearequipos_participate':
                giveawayMessageData = pluginManager.readData(button.message.id);
                participantid = await giveawayMessageData.participants.find(element => element == button.member.id);
                if(participantid){
                    let row = new Discord.ActionRowBuilder();
                    let button2 = new Discord.ButtonBuilder();
                    button2.setStyle(ButtonStyle.Danger);
                    button2.setLabel('Abandonar');
                    button2.setCustomId('sortearequipos_abandon');
                    row.addComponents([button2]);
                    button.reply({content: 'Ya estas participando del sorteo', ephemeral: true, components: [row]});
                } else if(!giveawayMessageData.teamAmount || giveawayMessageData.teamAmount * giveawayMessageData.participantsPerTeam >= giveawayMessageData.participantsAmount + 1){
                    await button.deferUpdate();
                    giveawayMessageData.participantsAmount = giveawayMessageData.participantsAmount + 1;
                    await giveawayMessageData.participants.push(button.member.user.id);
                    await pluginManager.writeData(giveawayMessageData.id, giveawayMessageData);
                    let message = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                    message.setTitle("Sorteo de equipos");
                    if(giveawayMessageData.teamAmount){
                        button.editReply({embeds: [message.setDescription("Participa para el sorteo de jugadores en " + giveawayMessageData.teamAmount + " con " + giveawayMessageData.participantsPerTeam + ` por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**`)]});
                    } else {
                        button.editReply({embeds: [message.setDescription("Participa para el sorteo de jugadores con " + giveawayMessageData.participantsPerTeam + ` por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**`)]});
                    }
                } else {
                    button.reply({ content: 'El sorteo ya no soporta mas participantes', ephemeral: true });
                }
                break;
            case 'sortearequipos_sortear':
                let tempuser2 = await button.channel.guild.members.fetch(button.member.id);
                if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await button.guild.fetchOwner() == button.member.id)){
                    button.reply({ content: 'No tienes permitido usar este boton', ephemeral: true});
                    return;
                }
                await button.deferUpdate();
                giveawayMessageData = await pluginManager.readData(button.message.id);
                let copy = [], n = giveawayMessageData.participantsAmount, i;
                while (n > 0) {
                    i = Math.floor(Math.random() * n);
                    await copy.push(giveawayMessageData.participants[i]);
                    giveawayMessageData.participants.splice(i,1);
                    n--;
                }
                giveawayMessageData.participants = copy;
                let teamnumber = 0;
                for (let index = 0; index < giveawayMessageData.participantsAmount;) {
                    teamnumber++;
                    let text = `**Equipo ${teamnumber}**\n`;
                    for (let index2 = index; index2 < index + giveawayMessageData.participantsPerTeam && index2 < giveawayMessageData.participantsAmount; index2++) {
                        let element = giveawayMessageData.participants[index2];
                        text += `<@${element}>\n`;
                    }
                    await button.channel.send(text);
                    index = index + giveawayMessageData.participantsPerTeam;
                }
                let message = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                message.setTitle("Sorteo de equipos");
                if(giveawayMessageData.teamAmount){
                    button.editReply({embeds: [message.setDescription("Sorteo de jugadores de " + giveawayMessageData.teamAmount + " equipos con " + giveawayMessageData.participantsPerTeam + ` jugadores por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**\n**FINALIZADO**`)], components:[]});
                } else {
                    button.editReply({embeds: [message.setDescription("Sorteo de jugadores con " + giveawayMessageData.participantsPerTeam + ` por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**\n**FINALIZADO**`)], components:[]});
                }
                //pluginManager.eraseData(button.message.id);
                button.followUp({ content: 'Sorteo Finalizado!', ephemeral: true });
                break;
            case 'sortearequipos_abandon':
                await button.deferUpdate();
                giveawayMessageData = pluginManager.readData(button.message.reference.messageId);
                participantindex = giveawayMessageData.participants.findIndex(element => element == button.member.id);
                if(participantindex != -1){
                    giveawayMessageData.participantsAmount--;
                    giveawayMessageData.participants.splice(participantindex,1);
                    pluginManager.writeData(giveawayMessageData.id, giveawayMessageData);
                    let message = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                    message.setTitle("Sorteo de equipos");
                    if(giveawayMessageData.teamAmount){
                        button.channel.messages.fetch(button.message.reference.messageId).then(messagetemp => messagetemp?.edit({embeds: [message.setDescription("Participa para el sorteo de jugadores en " + giveawayMessageData.teamAmount + " con " + giveawayMessageData.participantsPerTeam + ` por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**`)]}));
                    } else {
                        button.channel.messages.fetch(button.message.reference.messageId).then(messagetemp => messagetemp?.edit({embeds: [message.setDescription("Participa para el sorteo de jugadores con " + giveawayMessageData.participantsPerTeam + ` por equipo.\nParticipantes: **${giveawayMessageData.participantsAmount}**`)]}));
                    }
                    button.editReply({ content: 'Has salido del sorteo', ephemeral: true });
                }
                break;
        }
    }
}