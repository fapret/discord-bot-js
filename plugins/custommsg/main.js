/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');
const fs = require('fs');

/* Funcion para parsear textos en base a informacion de un miembro */
function internalParser(text, member){
    text = text.replace('${tag}', member.tag);
    text = text.replace('${userid}', member.id);
    text = text.replace('${username}', member.username);
    return text;
}

class Mutex {
    constructor() {
        this._locking = Promise.resolve();
    }
    lock() {
        let unlockNext;
        let willLock = new Promise(resolve => unlockNext = () => {      
            resolve();
        });
        let willUnlock = this._locking.then(() => unlockNext);
        this._locking = this._locking.then(() => willLock);
        return willUnlock;
    }
}

const MutexCreator = new Mutex();

const lockedMessages = new Map();

module.exports = {
    name: 'custommsg',
    description: 'modulo de mensajes customizados',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    version: '2.3.0.7e6a15565',
    async onAllMessage(message, dataManager){
        try{
            lowercasemessage = message.content.toLowerCase();
            pluginManager = dataManager.PluginDataManager;
            CustomMessages = pluginManager.readData(dataManager.GuildDataManager.getGuildID());
            if(CustomMessages == undefined){
                CustomMessages = [];
                pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), CustomMessages);
            }
            CustomMessages.forEach(element => {
                if(element.Channel == message.channel.id || element.Channel.toLowerCase() == "any" || element.Channel == "*"){
                    element.Messages.forEach(async (custommessage) => {
                        custommessage.Keywords.forEach(async (keyword) => {
                            if(((custommessage.WildCard == true) && (lowercasemessage.includes(keyword.toLowerCase()))) || lowercasemessage.startsWith(keyword.toLowerCase())){
                                if(custommessage.hasOwnProperty('RemainingUses')){
                                    msgMutex = await lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage));
                                    if(msgMutex == undefined){
                                        const unlock = await MutexCreator.lock();
                                        if(lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage)) == undefined){
                                            lockedMessages.set(message.channel.id + '.' + element.Messages.indexOf(custommessage), new Mutex());
                                        }
                                        unlock();
                                        msgMutex = lockedMessages.get(message.channel.id + '.' + element.Messages.indexOf(custommessage));
                                    }
                                    const unlockMsg = await msgMutex.lock();
                                    if(custommessage.RemainingUses == 0) {unlockMsg(); return}
                                    if(custommessage.RemainingUses > 0) {
                                        custommessage.RemainingUses = custommessage.RemainingUses - 1;
                                    }
                                    pluginManager.writeData(dataManager.GuildDataManager.getGuildID(), CustomMessages);
                                    console.log(custommessage);
                                    unlockMsg();
                                }
                                if(custommessage.hasOwnProperty('Embeed')){
                                    const embeedmessage = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                                    if(custommessage.Embeed.hasOwnProperty('Title')){
                                        embeedmessage.setTitle(custommessage.Embeed.Title);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('Description')){
                                        embeedmessage.setDescription(custommessage.Embeed.Description);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('color')){
                                        embeedmessage.setColor(custommessage.Embeed.color);
                                    }
                                    if(custommessage.Embeed.hasOwnProperty('Fields')){
                                        embeedmessage.addFields(custommessage.Embeed.Fields);
                                    }
                                    message.reply({embeds: [embeedmessage]});
                                }
                                if(custommessage.hasOwnProperty('Message')){
                                    message.reply(internalParser(custommessage.Message, message.author));
                                }
                                if(custommessage.hasOwnProperty('RandomComponent')){
                                    const componentAmount = Object.keys(custommessage.RandomComponent).length;
                                    var componentIndex = Math.floor(Math.random() * (componentAmount) + 1) - 1;
                                    if(custommessage.RandomComponent[componentIndex].hasOwnProperty('Embeed')){
                                        const embeedmessageComponent = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Title')){
                                            embeedmessageComponent.setTitle(custommessage.RandomComponent[componentIndex].Embeed.Title);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Description')){
                                            embeedmessageComponent.setDescription(custommessage.RandomComponent[componentIndex].Embeed.Description);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('color')){
                                            embeedmessageComponent.setColor(custommessage.RandomComponent[componentIndex].Embeed.color);
                                        }
                                        if(custommessage.RandomComponent[componentIndex].Embeed.hasOwnProperty('Fields')){
                                            embeedmessage.addFields(custommessage.RandomComponent[componentIndex].Embeed.Fields);
                                        }
                                        message.reply({embeds: [embeedmessageComponent]});
                                    }
                                    if(custommessage.RandomComponent[componentIndex].hasOwnProperty('Message')){
                                        message.reply(internalParser(custommessage.RandomComponent[componentIndex].Message), message.author);
                                    }
                                }
                            };
                        });
                    });
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}