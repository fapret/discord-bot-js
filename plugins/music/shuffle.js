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
    name: 'music.shuffle',
    description: 'modulo de musica, comando shuffle',
    author: 'fapret (Santiago Nicolas Diaz Conde)',
    async execute(message, queue){
        var copy = [], copyVotes = [], n = queue.songs.length, i;
        copy.push(queue.songs[0]);
        if(queue.skipVotes[0] == null){
            queue.skipVotes[0] = []
        }
        copyVotes[0] = queue.skipVotes[0];
        delete queue.songs[0];
        delete queue.skipVotes[0];
        n--;
        while (n) {
            i = Math.floor(Math.random() * queue.songs.length);
            if (i in queue.songs) {
                copy.push(queue.songs[i]);
                if(queue.skipVotes[i] == null){
                    queue.skipVotes[i] = []
                }
                copyVotes.push(queue.skipVotes[i]);
                delete queue.songs[i];
                delete queue.skipVotes[i];
                n--;
            }
        }
        queue.songs = copy;
        queue.skipVotes = copyVotes;
        message.reply(config.Messages['shuffled-correctly']);
    }
}