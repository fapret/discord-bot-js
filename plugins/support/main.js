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

async function fn_createembeed(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let message2 = new Discord.MessageEmbed().setFooter("FapretBot");
    if(options.getString('title')){
        message2.setTitle(options.getString('title'));
    } else {
        message2.setTitle('Support');
    }
    message2.setDescription(options.getString('text'));
    let row = new Discord.MessageActionRow();
    let button = new Discord.MessageButton();
    button.setStyle('PRIMARY');
    button.setLabel('Crear Ticket');
    button.setCustomId('supportbtn');
    button.setEmoji('📩');
    row.addComponents([button]);
    slashcommand.channel.send({embeds: [message2], components: [row]});
    slashcommand.editReply({ content: 'Mensaje de soporte creado'});
}

async function fn_deleteembeed(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
}

async function fn_editembeed(dataManager, slashcommand) {
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
}

async function fn_addoption(dataManager, slashcommand) {
    pluginManager = dataManager.PluginDataManager;
    const {options} = slashcommand;
    let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
    if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
        slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
        return;
    }
    let message = await slashcommand.channel.messages.fetch(options.getString('id'));
    let category = options.getString('category');
    if(message){
        let supportMessageData = pluginManager.readData(options.getString('id'));
        if (supportMessageData){
            if(supportMessageData.optionsAmount < 25){
                try{
                    supportMessageData.optionsAmount++;
                    supportMessageData.options.push({id: supportMessageData.optionsAmount, modrole: options.getRole('modrole').toString(), text: options.getString('text').toString(), category: category});
                    pluginManager.writeData(options.getString('id'), supportMessageData);
                    slashcommand.editReply({ content: 'Opcion agregada correctamente'});
                } catch(err) {
                    slashcommand.editReply(err.toString());
                    return;
                }
            } else {
                slashcommand.editReply({ content: 'Ya se alcanzo el maximo de opciones disponibles, no es posible agregar mas opciones'});
                return;
            }
        } else {
            try{
                supportMessageData = {
                    optionsAmount: 1,
                    ticketsAmount: 0,
                    options: [{id: 1, modrole: options.getRole('modrole').toString(), text: options.getString('text').toString(), category: category}],
                    tickets: []
                }
                pluginManager.writeData(options.getString('id'), supportMessageData);
                slashcommand.editReply({ content: 'Opcion agregada correctamente'});
            } catch(err) {
                slashcommand.editReply(err.toString());
                return;
            }
        }
    } else {
        slashcommand.editReply({ content: 'No se encontro el mensaje a agregar la opcion :c'});
        return;
    }
}

module.exports = {
    name: 'support',
    description: 'Sistema de tickets de soporte',
    author: 'fapret',
    version: '2.2.0.7e6814d',
    slashCommands: [
        {name: 'support', description: 'Maneja el sistema de soporte', options: [
            {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'createembeed', description: 'Crea un mensaje de soporte', options: [
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'text', description: 'Texto del mensaje de soporte', required: true},
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'title', description: 'Titulo del mensaje de soporte'}
            ]},
            {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'deleteembeed', description: 'Elimina un mensaje de soporte', options: [
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'id', description: 'Id del mensaje de soporte a eliminar', required: true}
            ]},
            {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'editembeed', description: 'Edita un mensaje de soporte', options: [
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'id', description: 'Id del mensaje a editar', required: true},
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'text', description: 'Texto del mensaje de soporte', required: true}
            ]},
            {type: Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND, name: 'addoption', description: 'Agrega una opcion a un mensaje de soporte', options: [
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'id', description: 'Id del mensaje a agregarle la opcion', required: true},
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'text', description: 'Texto de la opcion', required: true},
                {type: Discord.Constants.ApplicationCommandOptionTypes.ROLE, name: 'modrole', description: 'Rol de staff soporte', required: true},
                {type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'category', description: 'Categoria donde se crearan los tickets'}
            ]}
        ]}
    ],

    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        if (slashcommand.commandName == 'support'){
            await slashcommand.deferReply({ ephemeral: true });
           switch (options.getSubcommand()){
            case 'createembeed':
                fn_createembeed(dataManager, slashcommand);
                break;
            case 'deleteembeed':
                fn_deleteembeed(dataManager, slashcommand);
                break;
            case 'editembeed':
                fn_editembeed(dataManager, slashcommand);
                break;
            case 'addoption':
                fn_addoption(dataManager, slashcommand);
                break;
            default:
                break;
           }
        }
    },

    async onSelectMenu(dataManager, selectMenu){
        if (selectMenu.customId.startsWith('support')) {
            pluginManager = dataManager.PluginDataManager;
            const everyone = selectMenu.guild.roles.everyone;
            let supportMessageData = pluginManager.readData(pluginManager.readData(selectMenu.customId));
            let optionindex = selectMenu.values[0];
            let category = supportMessageData.options[optionindex-1].category;
            let channelmanager = selectMenu.guild.channels;
            let rolemanager = selectMenu.guild.roles;
            supportMessageData.ticketsAmount++;
            let role = await rolemanager.create({name: 'ticket-' + supportMessageData.ticketsAmount});
            let channel = await channelmanager.create('ticket-' + supportMessageData.ticketsAmount, { reason: 'Created ticket', permissionOverwrites: [
                {
                    id: everyone,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: supportMessageData.options[optionindex-1].modrole.slice(3, -1),
                    allow: ['VIEW_CHANNEL'],
                },
                {
                    id: role.id,
                    allow: ['VIEW_CHANNEL'],
                }
            ]});
             if(category){
                channel.setParent(category);
            }
            supportMessageData.tickets.push({channel: channel.id, category: category, role: role.id, author: selectMenu.member.id, modrole: supportMessageData.options[optionindex-1].modrole});
            pluginManager.writeData(pluginManager.readData(selectMenu.customId), supportMessageData);
            try{
                user = await selectMenu.guild.members.fetch(selectMenu.member.id);
                user.roles.add(role.id).catch(async error => {let localchannel = await user.createDM(); localchannel.send('parece que el rango del bot esta por debajo del rol al que se te deberia asignar por reaccionar un mensaje, por favor dile a un administrador de `' + reaction.message.guild.name + '` de dicha situacion para que la solucione.')});
                selectMenu.reply({ content: 'Ticket Creado! <#'+channel.id+'>', ephemeral: true });
            } catch(err) {
                console.log(err);
            }
        }
    },

    async onButtonClick(dataManager, button){
        if(button.customId == 'supportbtn'){
            const everyone = button.guild.roles.everyone;
            pluginManager = dataManager.PluginDataManager;
            let supportMessageData = pluginManager.readData(button.message.id);
            if(supportMessageData){
                if(supportMessageData.optionsAmount == 1){
                    //Crear ticket
                    let category = supportMessageData.options[0].category;
                    let channelmanager = button.guild.channels;
                    supportMessageData.ticketsAmount++;
                    let rolemanager = button.guild.roles;
                    let role = await rolemanager.create({name: 'ticket-' + supportMessageData.ticketsAmount});
                    let channel = await channelmanager.create('ticket-' + supportMessageData.ticketsAmount, { reason: 'Created ticket', permissionOverwrites: [
                        {
                            id: everyone.id,
                            deny: ['VIEW_CHANNEL'],
                        },
                        {
                            id: supportMessageData.options[0].modrole.slice(3, -1),
                            allow: ['VIEW_CHANNEL'],
                        },
                        {
                            id: role.id,
                            allow: ['VIEW_CHANNEL'],
                        }
                     ]});
                    if(category){
                        channel.setParent(category);
                    }
                    supportMessageData.tickets.push({channel: channel.id, category: category, role: role.id, author: button.member.id, modrole: supportMessageData.options[0].modrole});
                    pluginManager.writeData(button.message.id, supportMessageData);
                    try{
                        user = await button.guild.members.fetch(button.member.id);
                        user.roles.add(role.id).catch(async error => {let localchannel = await user.createDM(); localchannel.send('parece que el rango del bot esta por debajo del rol al que se te deberia asignar por reaccionar un mensaje, por favor dile a un administrador de `' + reaction.message.guild.name + '` de dicha situacion para que la solucione.')});
                        button.reply({ content: 'Ticket Creado! <#'+channel.id+'>', ephemeral: true });
                    } catch(err) {
                        console.log(err);
                    }
                } else {
                    let row = new Discord.MessageActionRow();
                    let selectBuilder = new Discord.MessageSelectMenu();
                    selectBuilder.setCustomId('support' + button.id);
                    selectBuilder.setPlaceholder('Selecciona una categoria de soporte');
                    for (let index = 0; index < supportMessageData.optionsAmount; index++) {
                       let option = supportMessageData.options[index];
                        selectBuilder.addOptions({label: option.text, value: index.toString()});
                    }
                    row.addComponents([selectBuilder]);
                    pluginManager.writeData('support' + button.id, button.message.id);
                    button.reply({ content: 'Elige que categoria de soporte solicitas', components: [row], ephemeral: true });
                }
            } else {
                button.reply({ content: 'No hay opciones de soporte configuradas, contacta un administrador', ephemeral: true });
                return;
            }
        }
    }
}