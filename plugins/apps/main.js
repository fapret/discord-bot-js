/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const config = require('./config.json');
const mainConfig = require('../../config.json');
const Discord = require('discord.js');
const fetch = require('node-fetch');

function internalParser(text, member, voiceChannel){
    if (member != null){
        text = text.replace('${tag}', member.user.tag);
        text = text.replace('${memberCount}', member.guild.memberCount);
        text = text.replace('${guild}', member.guild.name);
        text = text.replace('${joinDate}', member.joinedAt.toDateString());
        text = text.replace('${userid}', member.id);
        text = text.replace('${username}', member.user.username);
    }
    if(voiceChannel != null){
        text = text.replace('${voiceChannelID}', voiceChannel.id);
    }
    return text;
};

async function getInvite(appID, voiceChannel) {
    var code;
    await fetch(`https://discord.com/api/v9/channels/${voiceChannel.id}/invites`, {
        method: 'POST',
        body: JSON.stringify({
            max_age: 86400,
            max_uses: 0,
            target_application_id: appID,
            target_type: 2,
            temporary: false,
            validate: null
        }),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${mainConfig['bot-token']}`
        }
    }).then(res => res.json()).then(Data => {
        if (Data.error || !Data.code) {
            console.log(Data);
            console.log('No se pudo obtener el enlace. AppID: ' + appID);
            code = 'NULL';
        } else {
            code = Data.code;
        }
    });
    return `https://discord.com/invite/${code}`;
};

module.exports = {
    name: 'apps',
    description: 'modulo de apps',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    version: '2.2.0.7e6203571',
    async onMessage(message) {
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        try {
            var Apps = [];
            var row = new Discord.MessageActionRow();
            for (App of config.Apps) {
                let application = new Discord.MessageButton();
                application.setStyle('LINK');
                application.setLabel(App.Name);
                application.setEmoji(App.Emoji);
                var url = await getInvite(App.ID, voiceChannel);
                application.setURL(url);
                if(url != 'https://discord.com/invite/NULL'){
                    Apps.push(application);
                }
            };
            row.addComponents(Apps);

            const embeedmessage = new Discord.MessageEmbed().setFooter("FapretBot");
            embeedmessage.setTitle(config.Embeed.title);
            embeedmessage.setColor(config.Embeed.color);
            embeedmessage.setDescription(internalParser(config.Embeed.Description, message.member, voiceChannel));

            const embeedError = new Discord.MessageEmbed().setFooter("FapretBot");
            embeedError.setTitle("Error");
            embeedError.setColor("#FF0000");
            embeedError.setDescription(internalParser(config.Embeed.Error, message.member, voiceChannel));

            if(Apps.length != 0){
                message.channel.send({
                    embeds: [embeedmessage],
                    components: [row]
                });
            } else {
                message.channel.send({
                    embeds: {embeedError}
                });
            }
        } catch (err) {
            console.log(err);
        }
    }
}