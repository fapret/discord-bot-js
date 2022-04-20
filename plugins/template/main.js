/*
MIT License

Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
Aqui se encuentra presente un template de plugin para enlazar con el bot de discord
Fapretbot creado por fapret (Santiago Nicolas Diaz Conde)
Este template y su codigo, no esta bajo la licencia de FapretBot dado a que no es parte de
este, sino un programa para enlazar con este.
*/

//Es necesario importar discord para los tipos de datos de discord
const Discord = require('discord.js');

module.exports = {
    //El campo name es OBLIGATORIO, este define el nombre del plugin al momento de ser cargado, 
    //no puede poseer espacios, ni caracteres especiales
    name: 'template',

    //El campo description es opcional, este define la descripcion del plugin
    description: 'Descripcion de mi plugin',

    //El campo author es opcional, pero se recomienda colocarlo, define el autor del plugin
    author: 'Pon tu nombre aqui',

    //Version del plugin (solo puede contener letras minusculas, espacio, punto y digitos del 0 al 9) (opcional)
    //En caso de tener caracteres no permitidos como letras mayusculas, se ignorara el parametro
    //su unica utilidad es para saber que version del plugin se esta ejecutando.
    //se imprime en la consola cuando se carga el plugin
    version: 'Pon la version aqui',

    //Aqui se coloca un array con la informacion de cada slashcommand a ser utilizado por el plugin
    //es opcional
    slashCommands: [
        /*El formato de cada slash command es el siguiente:
        {name: 'example', description: 'Example description', options: []}
        El campo name de cada slash command equivale al comando en si, en este caso es /example, este campo es obligatorio
        El campo description define la descripcion del slashcommand, este campo es opcional
        El campo options define las opciones del slash command, se presenta como un array de opciones
        
        Cada opcion se escribe de la siguiente forma dentro de un objeto {}:
        ejemplo: {type:Discord.Constants.ApplicationCommandOptionTypes.USER, name: 'usuario', description: ''}
        -type es un tipo de dato de discord (ES OBLIGATORIO), los tipos disponibles son:
            -Discord.Constants.ApplicationCommandOptionTypes.STRING
            -Discord.Constants.ApplicationCommandOptionTypes.INTEGER
            -Discord.Constants.ApplicationCommandOptionTypes.BOOLEAN
            -Discord.Constants.ApplicationCommandOptionTypes.USER
            -Discord.Constants.ApplicationCommandOptionTypes.CHANNEL
            -Discord.Constants.ApplicationCommandOptionTypes.ROLE
            -Discord.Constants.ApplicationCommandOptionTypes.NUMBER
            -Discord.Constants.ApplicationCommandOptionTypes.MENTIONABLE
            -Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND
            -Discord.Constants.ApplicationCommandOptionTypes.SUB_COMMAND_GROUP
        -name es el nombre de la variable de la opcion (ES OBLIGATORIO)
        -description es la descripcion de la opcion (ES OBLIGATORIO)
        -required es un booleano que define si es obligatorio que el usuario ingrese la opcion
        -choices es un array de opciones disponibles para que el usuario elija con forma de objeto {}, 
            solo funciona con los types de STRING, INTEGER y NUMBER, el array puede contener hasta 25 elementos
            las opciones se definen como un objeto que posee dos parametros, name: nombre de la opcion, 
            y value: (STRING, INTEGER o NUMBER) es la opcion en si, heredada del type de la opcion
            ejemplo: {name: 'template', value: 'ejemplo'}
        -options es un array de options (como este) para ser usados con los type SUB_COMMAND o SUB_COMMAND_GROUP
        -channel_types es un array de canales para restringir su eleccion si el dato es de tipo CHANNEL
        -min_value es el valor minimo del numero ingresado por el usuario si el tipo de dato es INTEGER o NUMBER
        -max_value es el valor maximo del numero ingresado por el usuario si el tipo de dato es INTEGER o NUMBER
        */
    ],

    //funcion a ser ejecutada cuando un miembro se une a un servidor en el que esta presente el bot
    //recibe dos objetos, el dataManager (ver dataManager en la wiki de fapretBot) y un objeto member (https://discord.js.org/#/docs/main/stable/class/GuildMember)
    //es opcional
    async onMemberJoin(dataManager, member){},

    //funcion a ser ejecutada cuando un miembro cambia su estado en un canal de voz
    //por ejemplo cuando se une a un canal de voz, o sale de este
    //recibe 3 objetos, el dataManager (ver dataManager en la wiki de fapretBot), el anterior estado de voz y el nuevo estado de voz
    //objeto estado de voz: https://discord.js.org/#/docs/main/stable/class/VoiceState
    //es opcional
    async voiceStateUpdate(dataManager, oldstate, newstate){},

    //funcion a ser ejecutada cuando un usuario ejecuta un slashcommand
    //recibe dos objetos, el dataManager (ver dataManager en la wiki de fapretBot) y un objeto interaction de tipo command (https://discord.js.org/#/docs/discord.js/stable/class/CommandInteraction)
    //es opcional
    async onSlashCommand(dataManager, slashcommand){},

    //funcion a ser ejecutada cuando un usuario presiona un boton de un mensaje del bot
    //recibe dos objetos, el dataManager (ver dataManager en la wiki de fapretBot) y un objeto interaction de tipo button (https://discord.js.org/#/docs/discord.js/stable/class/ButtonInteraction)
    //es opcional
    async onButtonClick(dataManager, button){},

    //funcion a ser ejecutada cuando un usuario reacciona a un mensaje
    //recibe tres objetos, el dataManager (ver dataManager en la wiki de fapretBot), un objeto reaction (https://discord.js.org/#/docs/discord.js/stable/class/MessageReaction), y un objeto user simple
    //es opcional
    async onReactionAdd(dataManager, reaction, user){},

    //funcion a ser ejecutada cuando un usuario quita la reaccion de un mensaje
    //recibe tres objetos, el dataManager (ver dataManager en la wiki de fapretBot), un objeto reaction (https://discord.js.org/#/docs/discord.js/stable/class/MessageReaction), y un objeto user simple
    //es opcional
    async onReactionRemove(dataManager, reaction, user){},

    //funcion a ser ejecutada cuando un usuario envia un mensaje que inicia por <bot prefix>!<plugin.name> recibe 3 objetos
    //message es un objeto message (https://discord.js.org/#/docs/discord.js/stable/class/Message), el dataManager (ver wiki de fapretBot), y args es el texto que iria despues de <bot prefix>!<plugin.name>, por ejemplo
    //si el prefix fuera f y el plugin example y el usuario escribiese f!example hola, args seria ["hola"]
    //es opcional
    async onMessage(message, dataManager, args){},

    //funcion a ser ejecutada cuando un usuario envia un mensaje que NO inicia por <bot prefix>!<plugin.name>
    //message es un objeto message (https://discord.js.org/#/docs/discord.js/stable/class/Message) y el dataManager (ver wiki de fapretBot)
    //es opcional
    async onAllMessage(message, dataManager){}
}