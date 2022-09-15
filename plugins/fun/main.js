/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const avatar = require('./avatar.js');
const hug = require('./hug.js');
const config = require('./config.json');
const Discord = require('discord.js');

module.exports = {
    name: 'fun',
    description: 'modulo de diversion',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    version: '2.2.0.7e6814d',
    slashCommands : [
        {name: 'avatar', description: 'Obten el avatar de un usuario', options: [{type: Discord.Constants.ApplicationCommandOptionTypes.USER, name: 'user', description: 'Usuario a obtener avatar', required: true}]},
        {name: 'hug', description: 'Abraza a un usuario', options: [{type: Discord.Constants.ApplicationCommandOptionTypes.USER, name: 'user', description: 'Usuario a abrazar', required: false},{type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'id', description: 'id de imagen', required: false},{type: Discord.Constants.ApplicationCommandOptionTypes.STRING, name: 'texto', description: 'texto de imagen', required: false}]}
    ],
    async onMessage(message, dataManager, args){
        switch (args[0]){
            case 'avatar':
                avatar.execute(message);
                break;
            case 'hug':
                hug.execute(message, dataManager, args);
                break;
            default:
                message.reply(config.Messages['no-action']);
                break;
        }
    },
    async onSlashCommand(dataManager, slashcommand){
        const {options} = slashcommand;
        switch (slashcommand.commandName){
            case 'avatar':
                await slashcommand.deferReply();
                avatar.execute(slashcommand);
                break;
            case 'hug':
                await slashcommand.deferReply();
                hug.execute(slashcommand, dataManager);
                break;
            default:
                break;
        }
    }
}