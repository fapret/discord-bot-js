/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const { createCanvas, loadImage, registerFont } = require('canvas');
registerFont(__dirname + '/DoHyeon-Regular.ttf', { family: 'Do-Hyeon'});
registerFont(__dirname + '/Bebas-Regular.ttf', { family: 'Bebas'});
const Discord = require('discord.js');

/* Funcion para parsear textos en base a informacion de un miembro */
function internalParser(text, member){
    text = text.replace('${tag}', member.user.tag);
    text = text.replace('${memberCount}', member.guild.memberCount);
    text = text.replace('${guild}', member.guild.name);
    text = text.replace('${joinDate}', member.joinedAt.toDateString());
    text = text.replace('${userid}', member.id);
    text = text.replace('${username}', member.user.username);
    return text;
}

function getchannel(member){
    if(member.guild.systemChannel != undefined){
        return member.guild.systemChannel.id;
    } else {
        return null;
    }
}

const defaultConf = require('./default.json');

module.exports = {
    //Se ejecuta al unirse un miembro a la guild, generando la imagen y enviandola al system channel
    async onMemberJoin(dataManager, member){
        pluginManager = dataManager.PluginDataManager;
        let welcomeModule = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
        if(!welcomeModule){
            /* Datos default del plugin */
            welcomeModule = defaultConf;
            welcomeModule.channel = getchannel(member);
            welcomeModule.imageUrl = __dirname + "/default.png";
            pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), welcomeModule);
        }
        if(welcomeModule.channel == null){
            return;
        };
        let channel = member.guild.channels.resolve(welcomeModule.channel);
        if(welcomeModule.message && welcomeModule.message != ""){
            await channel.send(internalParser(welcomeModule.message, member));
        };
        if(welcomeModule.useImage){
            const img = new createCanvas(parseInt(welcomeModule.imagesize.x), parseInt(welcomeModule.imagesize.y));
            const context = img.getContext('2d');
            const background = await loadImage(welcomeModule.imageUrl);
            context.drawImage(background, 0, 0, img.width, img.height);
            context.strokeStyle = welcomeModule.strokeColor;
            context.strokeRect(0, 0, img.width, img.height);
            context.save();
            context.fillStyle = welcomeModule.avatar.borderColor;
            context.beginPath();
            context.arc(parseInt(welcomeModule.avatar.x), parseInt(welcomeModule.avatar.y), parseInt(welcomeModule.avatar.radius) + parseInt(welcomeModule.avatar.border), 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
            context.beginPath();
            context.arc(parseInt(welcomeModule.avatar.x), parseInt(welcomeModule.avatar.y), parseInt(welcomeModule.avatar.radius), 0, Math.PI * 2, true);
            context.closePath();
            context.clip();
            const memberAvatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 1024}));
            context.drawImage(memberAvatar, parseInt(welcomeModule.avatar.x) - parseInt(welcomeModule.avatar.radius), parseInt(welcomeModule.avatar.y) - parseInt(welcomeModule.avatar.radius), parseInt(welcomeModule.avatar.radius) * 2, parseInt(welcomeModule.avatar.radius) * 2);
            context.restore();
            welcomeModule.texts.forEach(element => {
                context.fillStyle = element.color;
                if(element.hasOwnProperty('align')){
                    context.textAlign = element.align;
                };
                var text = internalParser(element.text, member);
                context.font = `${element.size}px ${element.font}`;
                while ((context.measureText(text).width >= img.width - parseInt(element.x)) || (context.measureText(text).height >= img.height - parseInt(element.y))){
                    context.font = `${element.size -= 1}px ${element.font}`;
                };
                context.fillText(text, parseInt(element.x), parseInt(element.y));
                context.textAlign = "start";
            });
    
            const message = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
            if(welcomeModule.title != ""){
                message.setTitle(welcomeModule.title);
            }
            if(welcomeModule.description != ""){
                message.setDescription(internalParser(welcomeModule.description, member));
            }
            const attach = new Discord.AttachmentBuilder(img.toBuffer(), {name: `${member.user.id}.png`});
            message.setImage(`attachment://${member.user.id}.png`);
            channel.send({embeds: [message], files: [attach]});
        }
    },
    async onSlashCommand(dataManager, slashcommand){
        let welcomeModule;
        const {options} = slashcommand;
        if (slashcommand.commandName == 'welcome'){
            await slashcommand.deferReply({ ephemeral: true });
            let tempuser2 = await slashcommand.channel.guild.members.fetch(slashcommand.member.id);
            if(!tempuser2.roles.cache.has(dataManager.GuildDataManager.getProperty('operatorRole')) && !(await slashcommand.guild.fetchOwner() == slashcommand.member.id)){
                slashcommand.editReply({ content: 'No tienes el rol de operador para poder usar este comando'});
                return;
            }
            try{
                switch (options.getSubcommand()){
                    case 'settextmessage':
                        pluginManager = dataManager.PluginDataManager;
                        welcomeModule = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
                        if(!welcomeModule){
                            /* Datos default del plugin */
                            welcomeModule = defaultConf;
                            welcomeModule.channel = getchannel(tempuser2);
                            welcomeModule.imageUrl = __dirname + "/default.png";
                        }
                        welcomeModule.message = options.getString('text');
                        pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), welcomeModule);
                        slashcommand.editReply({ content: 'Texto de plugin de bienvenido setteado'});
                        break;
                    case 'enableimage':
                        pluginManager = dataManager.PluginDataManager;
                        welcomeModule = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
                        if(!welcomeModule){
                            /* Datos default del plugin */
                            welcomeModule = defaultConf;
                            welcomeModule.channel = getchannel(tempuser2);
                            welcomeModule.imageUrl = __dirname + "/default.png";
                        }
                        welcomeModule.useImage = options.getBoolean('useimage');
                        pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), welcomeModule);
                        slashcommand.editReply({ content: 'Seteado uso de imagen de bienvenida'});
                        break;
                    case 'setimageurl':
                        //TODO
                        break;
                    default:
                        break;
                }
            } catch (err){
                slashcommand.editReply({ content: 'Un error inesperado ha ocurrido, contacta al soporte'});
                console.log(err);//TODO manejo de logs
                dataManager.microlib.logError(err.toString());
            }
        }
    }
}