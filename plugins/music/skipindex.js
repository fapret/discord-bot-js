/*
Copyright 2022 Santiago Nicolas Diaz Conde (https://github.com/fapret)

Por la presente se concede permiso, libre de cargos, a cualquier persona que obtenga una copia de este software y de los archivos de documentacion asociados (el "Software"), a la utilizacion, publicacion y distribucion del Software y a permitir a las personas a las que se les proporcione el Software a hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

Esta prohibido editar, fusionar, sublicenciar, vender copias del Software y realizar cualquier otra accion que no este expresamente permitida en este permiso.

Un programa que no contiene ningun derivado del Software, pero esta diseñado para trabajar con este Software al ser enlazado con este, sera denominado "trabajo que utiliza el Software". Dicho trabajo, por separado, no es un trabajo derivado del Software y por lo tanto cae por fuera de esta licencia.

EL SOFTWARE SE PROPORCIONA "COMO ESTA", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A GARANTÍAS DE COMERCIALIZACIÓN, IDONEIDAD PARA UN PROPÓSITO PARTICULAR E INCUMPLIMIENTO. EN NINGÚN CASO LOS AUTORES O PROPIETARIOS DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE NINGUNA RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O CUALQUIER OTRO MOTIVO, DERIVADAS DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O SU USO U OTRO TIPO DE ACCIONES EN EL SOFTWARE.
*/

const config = require('./config.json');
module.exports = {
    name: 'music.skipindex',
    description: 'modulo de musica',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue, args){
        const voiceChannel = message.member.voice.channel;
        if(!voiceChannel) {
            message.reply(config.Messages['must-be-on-voice-channel']);
            return;
        }
        args.shift();
        args[0] = parseInt(args[0]);
        if((args.length == 0) || (args[0] < 1) || !Number.isInteger(args[0])){
            message.reply(config.Messages['must-specify-index']);
            return;
        }
        if((queue.songs.length < 2) || (queue.songs.length - 1 < args[0])){
            message.channel.send(config.Messages['no-songs-to-skip']);
            return;
        }
        const member = message.member.id;
        if(queue.skipVotes[args[0]] == null){
            queue.skipVotes[args[0]] = [];
        }
        var memberID = queue.skipVotes[args[0]].find(element => element == member);
        if(!memberID){
            queue.skipVotes[args[0]].push(member);
            message.reply(config.Messages['skip-vote-sent']);
        } else {
            message.reply(config.Messages['already-skip-voted']);
            return;
        }
        membersPlaying = voiceChannel.members.size;
        if((membersPlaying/2) <= queue.skipVotes[args[0]].length){
            songTitle = queue.songs[args[0]].title;
            queue.songs.splice(args[0], 1);
            queue.skipVotes.splice(args[0], 1);
            message.channel.send(config.Messages['queue-song-skipped'] + songTitle);
        }
    }
}