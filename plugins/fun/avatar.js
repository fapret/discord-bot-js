/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const Discord = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
    name: 'fun.avatar',
    description: 'modulo de diversion',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message){
        const {options} = message;
        const img = new createCanvas(1024, 1024);
        const context = img.getContext('2d');
        var member = message.mentions?.users.first();
        if (member == undefined){
            if(options){
                member = options.getUser('user');
            } else
            member = message.author;
        }
        const memberAvatarURL = member.displayAvatarURL({ format: 'png', size: 1024});
        const memberAvatar = await loadImage(memberAvatarURL);
        context.drawImage(memberAvatar, 0, 0, 1024, 1024);
        const embeed = new Discord.EmbedBuilder().setFooter({text: "FapretBot"});
        const attach = new Discord.AttachmentBuilder(img.toBuffer(), {name: `${member.id}.png`});
        embeed.setImage(`attachment://${member.id}.png`);
        embeed.setURL(memberAvatarURL);
        embeed.setDescription(`[URL Avatar](${memberAvatarURL}) | ID: ${member.id}`);
        embeed.setAuthor(`${member.tag}`, memberAvatarURL);
        if(message.editReply){
            message.editReply({embeds: [embeed], files: [attach]});
        }
        else {
            message.reply({embeds: [embeed], files: [attach]});
        }
    }
}
