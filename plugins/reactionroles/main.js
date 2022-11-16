/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');

module.exports = {
    name: 'reactionroles',
    description: 'modulo de reactionroles',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    version: '2.3.0.7e6a15565',
    globalSlashCommands : [
       {name: 'addreactionroletomessage', description: 'Agrega a un mensaje una reaccion que brinda un rol, si es un mensaje tipo reaction role, lo edita.', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.String, name: 'messageid', description: 'Mensaje a reaccionar', required: true},  
            {type: Discord.ApplicationCommandOptionType.String, name: 'emoji', description: 'Emoji a reaccionar', required: true},
            {type: Discord.ApplicationCommandOptionType.Role, name: 'rol', description: 'Rol a reaccionar', required: true},
            {type: Discord.ApplicationCommandOptionType.Boolean, name: 'removeifreactionremoved', description: 'Remover rol si se retira la reaccion.', required: false},
            {type: Discord.ApplicationCommandOptionType.String, name: 'title', description: 'Cambiar titulo del mensaje de reacciones (opcional, valido solo para mensajes del bot)', required: false}
        ]},
        {name: 'createreactionrolemessage', description: 'Crea un mensaje para ser usado como reaction role', dm_permission: false, options: [
            {type: Discord.ApplicationCommandOptionType.String, name: 'title', description: 'Titulo del mensaje a reaccionar.', required: false}
        ]}
    ],//TODO hacer que sean subcomandos
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        pluginManager = dataManager.PluginDataManager;
        switch (slashcommand.commandName) {
            case 'addreactionroletomessage':
                let tempuser = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
                if((!tempuser.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole'))) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
                    slashcommand.reply({ content: 'No tienes el rol de operador para poder usar este comando', ephemeral: true });
                    return;
                }
                let message = await slashcommand.channel.messages.fetch(options.getString('messageid'));
                if(message){
                    let reactionMessageData = pluginManager.readData(options.getString('messageid'));
                    if (reactionMessageData){
                        for (const key in reactionMessageData.reactions) {
                            if (key.emoji == options.getString('emoji')) {
                                slashcommand.reply({ content: 'La reaccion ya se encuentra en el mensaje, no fue posible agregarla', ephemeral: true });
                                return;
                            }
                        }
                        if(reactionMessageData.reactionsAmount < 20){
                            try{
                                message.react(options.getString('emoji'));
                                reactionMessageData.reactionsAmount++;
                                reactionMessageData.reactions.push({emoji: options.getString('emoji'), role: options.getRole('rol').toString(), removeifreactionremoved: options.getBoolean('removeifreactionremoved')});
                                pluginManager.writeData(options.getString('messageid'), reactionMessageData);
                            } catch(err) {
                                slashcommand.reply(err.toString());
                                return;
                            }
                        } else {
                            slashcommand.reply({ content: 'Ya se alcanzo el maximo de reacciones disponibles, no es posible agregar mas reacciones', ephemeral: true });
                            return;
                        }
                    } else {
                        try{
                            message.react(options.getString('emoji'));
                            reactionMessageData = {
                                reactionsAmount: 1,
                                reactions: [{emoji: options.getString('emoji'), role: options.getRole('rol').toString(), removeifreactionremoved: options.getBoolean('removeifreactionremoved')}]
                            }
                            pluginManager.writeData(options.getString('messageid'), reactionMessageData);
                        } catch(err) {
                            slashcommand.reply(err.toString());
                            return;
                        }
                    }
                    let embed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                    if(options.getString('title')){
                        embed.setTitle(options.getString('title'));
                    } else {
                        if(message.embeds[0].title){
                            embed.setTitle(message.embeds[0].title)
                        } else {
                            embed.setTitle('Reaction Roles');
                        }
                    }
                    var description = 'ROLES: \n';
                    for (const key in reactionMessageData.reactions) {
                        description = description + reactionMessageData.reactions[key].emoji + ' ' + reactionMessageData.reactions[key].role + '\n';
                    }
                    description = description;
                    embed.setDescription(description);
                    if(message.author.id == slashcommand.client.user.id){
                        message.edit({embeds: [embed]});
                    }
                    slashcommand.reply({ content: 'Se agrego exitosamente la reaccion', ephemeral: true });
                } else {
                    slashcommand.reply({ content: 'No se encontro el mensaje a agregar las reacciones :c', ephemeral: true });
                    return;
                }
                break;
            case 'createreactionrolemessage':
                let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
                if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
                    slashcommand.reply({ content: 'No tienes el rol de operador para poder usar este comando', ephemeral: true });
                    return;
                }
                let message2 = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                if(options.getString('title')){
                    message2.setTitle(options.getString('title'));
                } else {
                    message2.setTitle('Reaction Roles');
                }
                message2.setDescription('ROLES:');
                slashcommand.channel.send({embeds: [message2]});
                slashcommand.reply({ content: 'Mensaje de reaction role creado', ephemeral: true });
                break;
            default:
                break;
        }
    },
    async onReactionAdd(dataManager, reaction, user){
        pluginManager = dataManager.PluginDataManager;
        let reactionMessageData = pluginManager.readData(reaction.message.id);
        if(reactionMessageData){
            let reactionData = reactionMessageData.reactions.find(element => element.emoji == reaction.emoji.toString());
            if(reactionData){
                try{
                    user = await reaction.message.guild.members.fetch(user.id);
                    user.roles.add(reactionData.role.slice(3, -1)).catch(async error => {let localchannel = await user.createDM(); localchannel.send('parece que el rango del bot esta por debajo del rol al que se te deberia asignar por reaccionar un mensaje, por favor dile a un administrador de `' + reaction.message.guild.name + '` de dicha situacion para que la solucione.')});
                } catch(err) {
                    console.log(err);
                }
            }
        }
    },
    async onReactionRemove(dataManager, reaction, user){
        pluginManager = dataManager.PluginDataManager;
        let reactionMessageData = pluginManager.readData(reaction.message.id);
        if(reactionMessageData){
            let reactionData = reactionMessageData.reactions.find(element => (element.emoji == reaction.emoji.toString()) && element.removeifreactionremoved);
            if(reactionData){
                try{
                    user = await reaction.message.guild.members.fetch(user.id);
                    user.roles.remove(reactionData.role.slice(3, -1)).catch(async error => {let localchannel = await user.createDM(); localchannel.send('parece que el rango del bot esta por debajo del rol al que se te deberia remover por reaccionar un mensaje, por favor dile a un administrador de `' + reaction.message.guild.name + '` de dicha situacion para que la solucione.')});
                } catch(err) {
                    console.log(err);
                }
            }
        }
    }
}