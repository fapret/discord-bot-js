/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

//Es necesario importar discord para los tipos de datos de discord
const Discord = require('discord.js');
const { ButtonStyle, PermissionsBitField, ChannelType } = require('discord.js');

const {fn_createembeed} = require('./fn_createembeed.js');
const {fn_deleteembeed} = require('./fn_deleteembeed.js');
const {fn_editembeed} = require('./fn_editembeed.js');
const {fn_addoption} = require('./fn_addoption.js');
const {fn_closeticket} = require('./fn_closeticket.js');
const {fn_savetranscript} = require('./fn_savetranscript.js');
const {fn_lockticket} = require('./fn_lockticket.js');
const {fn_settranscriptchannel} = require('./fn_settranscriptchannel.js');
const {fn_opentickettouser} = require('./fn_opentickettouser.js');
const {fn_calculatetime} = require('./fn_calculatetime.js');
//const {fn_openai_transcript} = require('./fn_openai_transcript.js');

module.exports = {
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        if (slashcommand.commandName == 'support'){
           switch (options.getSubcommand()){
            case 'createembeed':
                await slashcommand.deferReply({ ephemeral: true });
                fn_createembeed(dataManager, slashcommand); //TODO cambiar por modal
                break;
            case 'deleteembeed':
                await slashcommand.deferReply({ ephemeral: true });
                fn_deleteembeed(dataManager, slashcommand); //TODO
                break;
            case 'editembeed':
                await slashcommand.deferReply({ ephemeral: true });
                fn_editembeed(dataManager, slashcommand);
                break;
            case 'addoption':
                await slashcommand.deferReply({ ephemeral: true });
                fn_addoption(dataManager, slashcommand);
                break;
            case 'settranscriptchannel':
                await slashcommand.deferReply({ ephemeral: true });
                fn_settranscriptchannel(dataManager, slashcommand);
                break;
            case 'opentickettouser':
                fn_opentickettouser(dataManager, slashcommand);
                break;
            /*
            case 'aitranscript':
                await slashcommand.deferReply({ ephemeral: true });
                fn_openai_transcript(dataManager, slashcommand);
                break;
            */
            default:
                break;
           }
        }
    },

    async onSelectMenu(dataManager, selectMenu){
        if (selectMenu.customId.startsWith('support')) {
            let pluginManager = dataManager.PluginDataManager;
            const everyone = selectMenu.guild.roles.everyone;
            let supportID = selectMenu.message.reference.messageId;
            let supportMessageData = pluginManager.readData(supportID);
            let optionindex = selectMenu.values[0];
            let aux = fn_calculatetime(dataManager, selectMenu, supportID, supportMessageData, optionindex);
            if(aux == undefined){
                return;
            }
            supportMessageData = aux;
            let category = supportMessageData.options[optionindex]?.category;
            let channelmanager = selectMenu.guild.channels;
            supportMessageData.ticketsAmount++;
            supportMessageData.ticketsOpen++;
            let channel = await channelmanager.create({name: 'ticket-' + supportMessageData.ticketsAmount, type: ChannelType.GuildText, reason: 'Created ticket', topic: supportMessageData.options[optionindex].text, permissionOverwrites: [
                {
                    id: everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: supportMessageData.options[optionindex].modrole,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: selectMenu.member.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]});
            if(category){
                channel.setParent(category, { lockPermissions: false });
                //TODO create category if more than 50 tickets
            }
            pluginManager.writeData(supportID, supportMessageData);
            let ticketinfo = {index: optionindex, supportID: supportID, author: selectMenu.member.id, modrole: supportMessageData.options[optionindex].modrole, topic: supportMessageData.options[optionindex].text, category: category};
            pluginManager.writeData('ticket/' + channel.id, ticketinfo);

            //Embeed creation
            let embeed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
            embeed.setTitle('Support');
            embeed.setDescription('Reason: ** ' + supportMessageData.options[optionindex].text + ` **\n<@${selectMenu.member.id}> El soporte te atendera pronto.`);
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
            button3.setStyle(ButtonStyle.Primary);
            button3.setLabel('Lock ticket');
            button3.setCustomId('supportlock');
            button3.setEmoji('🔒');
            row.addComponents([button3, button2, button1]);
            channel.send({embeds: [embeed], components: [row]});

            try{
                user = await selectMenu.guild.members.fetch(selectMenu.member.id);
                selectMenu.reply({ content: 'Ticket Creado! <#'+channel.id+'>', ephemeral: true });
            } catch(err) {
                console.log(err);
                dataManager.microlib.logError(err.toString());
            }
        }
    },

    async onButtonClick(dataManager, button){
        switch (button.customId) {
            case 'supportbtn':
                await button.deferReply({ephemeral: true});
                const everyone = button.guild.roles.everyone;
                let pluginManager = dataManager.PluginDataManager;
                let supportMessageData = pluginManager.readData(button.message.id);
                if(supportMessageData){
                    if(supportMessageData.optionsAmount == 1){
                        //Crear ticket
                        let aux = fn_calculatetime(dataManager, button, button.message.id, supportMessageData, 0);
                        if(aux == undefined){
                            return;
                        }
                        supportMessageData = aux;
                        let category = supportMessageData.options[0].category;
                        let channelmanager = button.guild.channels;
                        supportMessageData.ticketsAmount++;
                        supportMessageData.ticketsOpen++;
                        let channel = await channelmanager.create({name: 'ticket-' + supportMessageData.ticketsAmount, type: ChannelType.GuildText, reason: 'Created ticket', topic: supportMessageData.options[0].text, permissionOverwrites: [
                            {
                                id: everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]
                            },
                            {
                                id: supportMessageData.options[0].modrole,
                                allow: [PermissionsBitField.Flags.ViewChannel]
                            },
                            {
                                id: button.member.id,
                                allow: [PermissionsBitField.Flags.ViewChannel]
                            }
                         ]});
                        if(category){
                            channel.setParent(category, { lockPermissions: false });
                            //TODO create category if more than 50 tickets
                        }
                        pluginManager.writeData(button.message.id, supportMessageData);
                        let ticketinfo = {index: 1, supportID: button.message.id, author: button.member.id, modrole: supportMessageData.options[0].modrole, topic: supportMessageData.options[0].text, category: category};
                        pluginManager.writeData('ticket/' + channel.id, ticketinfo);

                        //Embeed creation
                        let embeed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                        embeed.setTitle('Support');
                        embeed.setDescription('Reason: ** ' + supportMessageData.options[0].text + ` **\n<@${button.member.id}> El soporte te atendera pronto.`);
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
                        button3.setStyle(ButtonStyle.Primary);
                        button3.setLabel('Lock ticket');
                        button3.setCustomId('supportlock');
                        button3.setEmoji('🔒');
                        row.addComponents([button3, button2, button1]);
                        channel.send({embeds: [embeed], components: [row]});

                        button.editReply({ content: 'Ticket Creado! <#'+channel.id+'>'});
                    } else {
                        let row = new Discord.ActionRowBuilder();
                        let selectBuilder = new Discord.StringSelectMenuBuilder();
                        selectBuilder.setCustomId('support');
                        selectBuilder.setPlaceholder('Selecciona una categoria de soporte');
                        for (let index = 0; index < supportMessageData.optionsAmount; index++) {
                           let option = supportMessageData.options[index];
                            selectBuilder.addOptions({label: option.text, value: index.toString()});
                        }
                        row.addComponents([selectBuilder]);
                        button.editReply({ content: 'Elige que categoria de soporte solicitas', components: [row]});
                    }
                } else {
                    button.editReply({ content: 'No hay opciones de soporte configuradas, contacta un administrador'});
                    return;
                }
                break;
            case 'supporttranscript':
                await button.deferReply();
                fn_savetranscript(dataManager, button);
                break;
            case 'supportlock':
                await button.deferReply();
                fn_lockticket(dataManager, button);
                break;
            case 'supportclose':
                await button.deferReply();
                fn_closeticket(dataManager, button);
                break;
            default:
                break;
        }
    },

    async onModal(dataManager, modal){
        if (modal.customId.startsWith('support')){
            await modal.deferReply({ephemeral: true});
            let tempuser2 = await modal.channel.guild.members.fetch(modal.member.id);
            if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await modal.guild.fetchOwner() == modal.member.id)){
                modal.editReply({ content: 'No tienes el rol de operador para poder usar este modal'});
                return;
            }
            let pluginManager = dataManager.PluginDataManager;
            const everyone = modal.guild.roles.everyone;
            let supportMessageData = pluginManager.readData('cache/' + modal.customId.substring(7));
            supportMessageData.topic = modal.fields.getTextInputValue('topic');
            let channelmanager = modal.guild.channels;
            let channel = await channelmanager.create({name: 'ticket-' + supportMessageData.authorName, type: ChannelType.GuildText, reason: 'Created ticket', topic: supportMessageData.topic, permissionOverwrites: [
                {
                    id: everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: supportMessageData.modrole,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: modal.member.id,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: supportMessageData.author,
                    allow: [PermissionsBitField.Flags.ViewChannel]
                }
            ]});
            if(supportMessageData.category){
                channel.setParent(supportMessageData.category, { lockPermissions: false });
                //TODO create category if more than 50 tickets
            }
            pluginManager.writeData('ticket/' + channel.id, supportMessageData);
            //Embeed creation
            let embeed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
            embeed.setTitle('Support');
            embeed.setDescription('Reason: ** ' + supportMessageData.topic + ` **\n<@${supportMessageData.author}> El soporte te atendera pronto.`);
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
            button3.setStyle(ButtonStyle.Primary);
            button3.setLabel('Lock ticket');
            button3.setCustomId('supportlock');
            button3.setEmoji('🔒');
            row.addComponents([button3, button2, button1]);
            channel.send({embeds: [embeed], components: [row]});

            modal.editReply({ content: 'Ticket Creado! <#'+channel.id+'>'});
            //pluginManager.eraseData('cache/' + modal.customId.substring(7)); //TODO

            let tempuser3 = await modal.channel.guild.members.fetch(supportMessageData.author);
            let localchannel = await tempuser3.createDM();
            localchannel.send(
                {embeds: [new Discord.EmbedBuilder().setFooter({text: "FapretBot"})
                .setTitle('Support')
                .setDescription(`<@${modal.member.id}> te ha abierto un ticket en ${modal.guild.name}:<#${channel.id}>! Con el topico: ${supportMessageData.topic}`)]}
            );
        }
    }
}